#!/usr/bin/env python3
"""Build standalone NotebookLM documents without third-party dependencies.

Run: python3 docs/notebooklm/generate.py [--output ROOT]
Default ROOT is the training repo. No source/report files are changed.
"""
import argparse
import json
import re
from pathlib import Path
from lessons import WEEKS

HERE = Path(__file__).resolve().parent


def build(root):
    template = (HERE / 'template.html').read_text()
    css = (HERE / 'base.css').read_text()
    icons = (HERE / 'icons.js').read_text()
    runtime = (HERE / 'runtime.js').read_text()
    icon_map = dict(re.findall(r'(\w+): `(<svg.*?</svg>)`', icons))
    modes = [('video', 'Video bài giảng'), ('slide', 'Bộ slide'),
             ('audio', 'Âm thanh'), ('mindmap', 'Bản đồ tư duy'), ('quiz', 'Tự kiểm tra')]
    buttons = '\n'.join(
        f'<button type="button" role="tab" id="tab-{key}" data-mode="{key}" '
        f'aria-controls="promptPanel" aria-selected="{str(index == 0).lower()}" '
        f'tabindex="{0 if index == 0 else -1}" class="modality-tab{(" active" if index == 0 else "")}">'
        f'<span class="anticon" aria-hidden="true">{icon_map[key]}</span><span>{label}</span></button>'
        for index, (key, label) in enumerate(modes))
    data = json.dumps(WEEKS, ensure_ascii=False, indent=2).replace('<', '\\u003c')
    book = '<span class="anticon anticon-book"><svg viewBox="64 64 896 896" focusable="false" width="1em" height="1em" fill="currentColor"><path d="M832 64H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-260 72h96v209.9L621.5 312 572 347.4V136zm220 752H232V136h280v296.9c0 3.3 1 6.6 3 9.3a15.9 15.9 0 0022.3 3.7l83.8-59.9 81.4 59.4c2.7 2 6 3.1 9.4 3.1 8.8 0 16-7.2 16-16V136h64v752z"/></svg></span>'
    targets = [(f'week-{w}/NOTEBOOKLM_PROMPTS_WEEK{w}.html', w) for w in range(1, 7)]
    targets += [('docs/NOTEBOOKLM_PROMPTS_WEEK1.html', 1), ('docs/NOTEBOOKLM_PROMPTS.html', 1)]
    for path, initial in targets:
        values = dict(TITLE=f'Bộ prompt NotebookLM · Tuần {initial}', CSS=css,
                      BOOK_ICON=book, MODE_BUTTONS=buttons, DATA=data,
                      INITIAL_WEEK=str(initial), ICONS=icons, RUNTIME=runtime)
        result = re.sub(r'\{\{([A-Z_]+)\}\}', lambda match: values[match[1]], template)
        target = root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(result)
    print(f'Built {len(targets)} HTML files · {sum(len(w["lessons"]) for w in WEEKS)} lessons · 220 prompts')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=HERE.parent.parent)
    build(parser.parse_args().output.resolve())
