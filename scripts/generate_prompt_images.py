#!/usr/bin/env python3
"""Batch-generate prompt gallery images through a ComfyUI API workflow.

The script reads assets/data/prompts.json, injects each entry's imagePrompt into
the positive CLIPTextEncode node, submits the workflow to ComfyUI, downloads the
SaveImage output, and updates the prompt entry's image path.
"""

from __future__ import annotations

import argparse
import copy
import json
import random
import time
import urllib.parse
import urllib.request
import uuid
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_COMFY_URL = "http://192.168.188.76:8188"
DEFAULT_WORKFLOW = ROOT / "_imports" / "flux2-prompt-to-image-api.json"
DEFAULT_PROMPTS = ROOT / "assets" / "data" / "prompts.json"
DEFAULT_OUT = ROOT / "assets" / "images" / "prompts"


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def http_json(url: str, payload: dict | None = None, timeout: int = 30) -> dict:
    if payload is None:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))

    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def download_file(url: str, dest: Path, timeout: int = 60) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(url, timeout=timeout) as response:
        dest.write_bytes(response.read())


def maybe_convert_webp(source_png: Path, webp_path: Path, quality: int) -> bool:
    try:
        from PIL import Image
    except Exception:
        return False

    webp_path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source_png) as image:
        image.save(webp_path, "WEBP", quality=quality, method=6)
    return True


def set_node_input(workflow: dict, node_id: str, key: str, value) -> None:
    if node_id not in workflow:
        raise KeyError(f"Workflow node {node_id} not found")
    workflow[node_id].setdefault("inputs", {})[key] = value


def image_prompt_for(entry: dict) -> str:
    return entry.get("imagePrompt") or entry.get("prompt") or ""


def negative_prompt_for(entry: dict, fallback: str) -> str:
    return entry.get("negativePrompt") or fallback


def seed_for(base_seed: int, index: int, mode: str) -> int:
    if mode == "fixed":
        return base_seed
    if mode == "random":
        return random.randint(1, 2**63 - 1)
    return base_seed + index


def queue_prompt(comfy_url: str, workflow: dict, client_id: str) -> str:
    result = http_json(
        f"{comfy_url.rstrip('/')}/prompt",
        {"prompt": workflow, "client_id": client_id},
        timeout=30,
    )
    prompt_id = result.get("prompt_id")
    if not prompt_id:
        raise RuntimeError(f"ComfyUI did not return prompt_id: {result}")
    return prompt_id


def wait_for_history(comfy_url: str, prompt_id: str, timeout_seconds: int, poll_seconds: float) -> dict:
    deadline = time.time() + timeout_seconds
    history_url = f"{comfy_url.rstrip('/')}/history/{prompt_id}"
    while time.time() < deadline:
        history = http_json(history_url, timeout=30)
        if prompt_id in history:
            return history[prompt_id]
        time.sleep(poll_seconds)
    raise TimeoutError(f"Timed out waiting for ComfyUI prompt {prompt_id}")


def first_saved_image(history_entry: dict, save_node_id: str) -> dict:
    outputs = history_entry.get("outputs", {})
    node_output = outputs.get(save_node_id) or {}
    images = node_output.get("images") or []
    if not images:
        raise RuntimeError(f"No images found in SaveImage node {save_node_id}: {outputs}")
    return images[0]


def image_view_url(comfy_url: str, image_info: dict) -> str:
    query = urllib.parse.urlencode(
        {
            "filename": image_info["filename"],
            "subfolder": image_info.get("subfolder", ""),
            "type": image_info.get("type", "output"),
        }
    )
    return f"{comfy_url.rstrip('/')}/view?{query}"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate /prompts gallery images with ComfyUI.")
    parser.add_argument("--comfy-url", default=DEFAULT_COMFY_URL)
    parser.add_argument("--workflow", type=Path, default=DEFAULT_WORKFLOW)
    parser.add_argument("--prompts", type=Path, default=DEFAULT_PROMPTS)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--positive-node", default="87")
    parser.add_argument("--negative-node", default="81")
    parser.add_argument("--width-node", default="85")
    parser.add_argument("--height-node", default="86")
    parser.add_argument("--sampler-node", default="80")
    parser.add_argument("--save-node", default="88")
    parser.add_argument("--width", type=int, default=1344)
    parser.add_argument("--height", type=int, default=1008)
    parser.add_argument("--base-seed", type=int, default=316229828415853)
    parser.add_argument("--seed-mode", choices=["increment", "fixed", "random"], default="increment")
    parser.add_argument("--limit", type=int, default=0, help="Generate only the first N matching entries.")
    parser.add_argument("--start", type=int, default=0, help="Skip the first N entries.")
    parser.add_argument("--only-id", action="append", default=[], help="Generate one or more specific entry ids.")
    parser.add_argument("--skip-existing", action="store_true")
    parser.add_argument("--no-update-json", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--timeout", type=int, default=900)
    parser.add_argument("--poll", type=float, default=1.5)
    parser.add_argument("--webp-quality", type=int, default=86)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    workflow_template = read_json(args.workflow)
    prompts_data = read_json(args.prompts)
    entries = prompts_data.get("entries", [])

    if args.only_id:
        wanted = set(args.only_id)
        selected = [entry for entry in entries if entry.get("id") in wanted]
    else:
        selected = entries[args.start :]
        if args.limit:
            selected = selected[: args.limit]

    fallback_negative = workflow_template.get(args.negative_node, {}).get("inputs", {}).get("text", "")
    client_id = str(uuid.uuid4())
    source_dir = args.out / "source"
    args.out.mkdir(parents=True, exist_ok=True)
    source_dir.mkdir(parents=True, exist_ok=True)

    print(f"ComfyUI: {args.comfy_url}")
    print(f"Entries: {len(selected)}")
    print(f"Size: {args.width}x{args.height}")

    generated_paths: dict[str, str] = {}
    for index, entry in enumerate(selected):
        entry_id = entry["id"]
        webp_path = args.out / f"{entry_id}.webp"
        png_path = source_dir / f"{entry_id}.png"

        if args.skip_existing and (webp_path.exists() or png_path.exists()):
            print(f"[skip] {entry_id} already exists")
            continue

        workflow = copy.deepcopy(workflow_template)
        set_node_input(workflow, args.positive_node, "text", image_prompt_for(entry))
        set_node_input(workflow, args.negative_node, "text", negative_prompt_for(entry, fallback_negative))
        set_node_input(workflow, args.width_node, "value", args.width)
        set_node_input(workflow, args.height_node, "value", args.height)
        set_node_input(workflow, args.sampler_node, "seed", seed_for(args.base_seed, index, args.seed_mode))
        set_node_input(workflow, args.save_node, "filename_prefix", f"prompts/{entry_id}")

        if args.dry_run:
            print(f"[dry-run] {entry_id}: {entry['title']}")
            continue

        print(f"[queue] {entry_id}: {entry['title']}")
        prompt_id = queue_prompt(args.comfy_url, workflow, client_id)
        history = wait_for_history(args.comfy_url, prompt_id, args.timeout, args.poll)
        image_info = first_saved_image(history, args.save_node)
        download_file(image_view_url(args.comfy_url, image_info), png_path)

        if maybe_convert_webp(png_path, webp_path, args.webp_quality):
            generated_paths[entry_id] = f"/assets/images/prompts/{entry_id}.webp"
            print(f"[done] {entry_id} -> {webp_path.relative_to(ROOT)}")
        else:
            generated_paths[entry_id] = f"/assets/images/prompts/source/{entry_id}.png"
            print(f"[done] {entry_id} -> {png_path.relative_to(ROOT)} (Pillow not installed; using PNG)")

    if generated_paths and not args.no_update_json:
        for entry in entries:
            entry_id = entry.get("id")
            if entry_id in generated_paths:
                entry["image"] = generated_paths[entry_id]
                entry["imageSource"] = f"/assets/images/prompts/source/{entry_id}.png"
                entry["imageAspect"] = "4:3"
                entry["imageSize"] = f"{args.width}x{args.height}"
        write_json(args.prompts, prompts_data)
        print(f"[updated] {args.prompts.relative_to(ROOT)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
