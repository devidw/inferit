<h1 align="center">
    <img src="./public/icon_32.png" alt="inferit" />
    <br />
    inferit
</h1>

_inferit_ is a visual take on llm inference. Most inference frontends are
limited to a single visual input/output "thread". This makes it hard to compare
output from different models, prompts and sampler settings. _inferit_ solves
this with its UI that allows for an unlimited number of side-by-side
generations. This makes it a perfect fit to compare and experiment with
different models, prompts and sampler settings.

![](./screens/screen_24-11-09.png)

Some example use cases:

- model exploration and comparison
- prompt engineering
- sampler setting optimizations

Supported Backends:

- Any local or remote backend that is compatible with the OpenAI API
- [Chrome built-in AI](https://developer.chrome.com/docs/ai/built-in) (Gemini Nano)

## run it

```bash
pnpm install
pnpm build
pnpm preview
```

## development

```bash
pnpm dev
```

Contributions of any kind are warmly welcomed!
