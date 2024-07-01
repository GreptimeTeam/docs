# Contributing to GreptimeDB Docs

## File Structure

This project uses markdown files to generate a documentation website.
All markdown files are located in the `docs` directory.

- The version directories in `/docs` match the [GreptimeDB](https://github.com/GreptimeTeam/greptimedb) version.
For example, `/docs/v0.4` contains the documentation for GreptimeDB v0.4.
- The file `summary.yml` defines the navigation of the documentation website.
It should match the current document structure.
You need to use `-` and lowercase letters in markdown file names so that `summary.yml` can recognize these file names.

### Document Localization

- The localized documentation is located in the `/docs/xx` directory, where `xx` is the language code.
- The `summary-i18n.yml` file in the `/docs/xx` directory defines the navigation of the localized documentation website.
The content in `summary-i18n.yml` should be the localized name of the relative directory.
If you add a new directory in `/docs/xx`, remember to update `summary-i18n.yml`.

## Links

- Use relative paths for internal links whenever possible.
- Reference files placed in `public` using root absolute path - for example, `public/icon.png` should always be referenced in source code as `/icon.png`.

## Style Guide

Please use [`example.drawio.svg`](docs/example.drawio.svg) as a template for drawing diagrams.
You can install the Draw.io Integration for VS Code and create a new diagram from the template.

If there is no suitable graphics, you can use other graphics,
but the colors should be consistent with the template.

## Markdown Lint

We use [markdownlint-cli](https://github.com/DavidAnson/markdownlint) to check
format of markdown files. You can do it locally with:

```shell
markdownlint -c .markdownlint.yaml **/*.md
```

You can also use markdownlint extension if you are using VS Code.

## Build and preview the docs locally

We highly encourage you to preview your changes locally before submitting a pull request.
This project requires Node.js version 18.0.0 or higher.
Use `npm install -g pnpm` to install package manager, and start a local server with the following commands:

```shell
pnpm install
pnpm run dev
```

You can also use `pnpm run build` to check dead links.

### Preview the Localized documentation

To preview the documentation in a specific language,
add a new file called `.env` to the root directory and include the `VITE_LANG=xx` environment variable,
where `xx` is the language code.
For example, to preview the Chinese documentation, add the following content to `.env`:

```shell
VITE_LANG=zh
```

Then start a local server with `pnpm run dev`.

## PR Title Check

We require pull request title to start with [these
keywords](https://github.com/GreptimeTeam/docs/blob/main/.github/pr-title-checker-config.json#L7C1-L7C1)

## Project participants

### Individual Committers (in alphabetical order)

[CookiePieWw](https://github.com/CookiePieWw)

[etolbakov](https://github.com/etolbakov)

[irenjj](https://github.com/irenjj)

[KKould](https://github.com/KKould)

[NiwakaDev](https://github.com/NiwakaDev)

### All Contributors (in alphabetical order)

[AbhineshJha](https://github.com/AbhineshJha)

[Aganivi](https://github.com/Aganivi)

[Anyc66666666](https://github.com/Anyc66666666)

[AntiTopQuark](https://github.com/AntiTopQuark)

[azhsmesos](https://github.com/azhsmesos)

[bcrant](https://github.com/bcrant)

[bigboss2063](https://github.com/bigboss2063)

[caicancai](https://github.com/caicancai)

[ccjeff](https://github.com/ccjeff)

[ccollie](https://github.com/ccollie)

[cjwcommuny](https://github.com/cjwcommuny)

[ck-567](https://github.com/ck-567)

[ClSlaid](https://github.com/ClSlaid)

[clickme-zxy](https://github.com/clickme-zxy)

[confoc](https://github.com/confoc)

[crwen](https://github.com/crwen)

[dalprahcd](https://github.com/dalprahcd)

[DiamondMofeng](https://github.com/DiamondMofeng)

[dimbtp](https://github.com/dimbtp)

[DevilExileSu](https://github.com/DevilExileSu)

[dependabot](https://github.com/dependabot)

[dongxuwang](https://github.com/dongxuwang)

[Dysprosium0626](https://github.com/Dysprosium0626)

[e1ijah1](https://github.com/e1ijah1)

[e1ijah1](https://github.com/e1ijah1)

[fbs](https://github.com/fbs)

[francis-du](https://github.com/francis-du)

[frostming](https://github.com/frostming)

[gcmutator](https://github.com/gcmutator)

[gitccl](https://github.com/gitccl)

[gobraves](https://github.com/gobraves)

[gongzhengyang](https://github.com/gongzhengyang)

[groobyming](https://github.com/groobyming)

[Gump9](https://github.com/Gump9)

[haohuaijin](https://github.com/haohuaijin)

[hezhizhen](https://github.com/hezhizhen)

[hygkui](https://github.com/hygkui)

[JetSquirrel](https://github.com/JetSquirrel)

[J0HN50N133](https://github.com/J0HN50N133)

[jun0315](https://github.com/jun0315)

[Kelvinyu1117](https://github.com/Kelvinyu1117)

[Kree0](https://github.com/Kree0)

[lbt05](https://github.com/lbt05)

[Lilit0x](https://github.com/Lilit0x)

[LinuxSuRen](https://github.com/LinuxSuRen)

[lizhemingi](https://github.com/lizhemingi)

[ltratt](https://github.com/ltratt)

[lyang24](https://github.com/lyang24)

[LYZJU2019](https://github.com/LYZJU2019)

[masonyc](https://github.com/masonyc)

[messense](https://github.com/messense)

[morigs](https://github.com/morigs)

[Morranto](https://github.com/Morranto)

[nearsyh](https://github.com/nearsyh)

[niebayes](https://github.com/niebayes)

[parkma99](https://github.com/parkma99)

[QuenKar](https://github.com/QuenKar)

[realtaobo](https://github.com/realtaobo)

[sarahlau0415](https://github.com/sarahlau0415)

[sarailQAQ](https://github.com/sarailQAQ)

[SergeTupchiy](https://github.com/SergeTupchiy)

[ShawnHXH](https://github.com/ShawnHXH)

[shenJunkun](https://github.com/shenJunkun)

[shoothzj](https://github.com/shoothzj)

[sjcsjc123](https://github.com/sjcsjc123)

[sjmiller609](https://github.com/sjmiller609)

[SSebo](https://github.com/SSebo)

[SteveLauC](https://github.com/SteveLauC)

[shawnh2](https://github.com/shawnh2)

[sunray-ley](https://github.com/sunray-ley)

[Taylor-lagrange](https://github.com/Taylor-lagrange)

[TheWaWaR](https://github.com/TheWaWaR)

[tizee](https://github.com/tizee)

[vinland-avalon](https://github.com/vinland-avalon)

[WangTingZheng](https://github.com/WangTingZheng)

[WL2O2O](https://github.com/WL2O2O)

[Xuanwo](https://github.com/Xuanwo)

[xie-zheng](https://github.com/xie-zheng)

[xifyang](https://github.com/xifyang)

[xxxuuu](https://github.com/xxxuuu)

[yaoyinnan](https://github.com/yaoyinnan)

[yfractal](https://github.com/yfractal)

[yuanbohan](https://github.com/yuanbohan)

[YCCDSZXH](https://github.com/YCCDSZXH)


### Team Members (in alphabetical order)

[apdong2022](https://github.com/apdong2022)

[beryl678](https://github.com/beryl678)

[Breeze-P](https://github.com/Breeze-P)

[daviderli614](https://github.com/daviderli614)

[discord9](https://github.com/discord9)

[evenyag](https://github.com/evenyag)

[fengjiachun](https://github.com/fengjiachun)

[fengys1996](https://github.com/fengys1996)

[GrepTime](https://github.com/GrepTime)

[holalengyu](https://github.com/holalengyu)

[killme2008](https://github.com/killme2008)

[MichaelScofield](https://github.com/MichaelScofield)

[nicecui](https://github.com/nicecui)

[paomian](https://github.com/paomian)

[shuiyisong](https://github.com/shuiyisong)

[sunchanglong](https://github.com/sunchanglong)

[sunng87](https://github.com/sunng87)

[tisonkun](https://github.com/tisonkun)

[v0y4g3r](https://github.com/v0y4g3r)

[waynexia](https://github.com/waynexia)

[Wenjie0329](https://github.com/Wenjie0329)

[WenyXu](https://github.com/WenyXu)

[xtang](https://github.com/xtang)

[zhaoyingnan01](https://github.com/zhaoyingnan01)

[zhongzc](https://github.com/zhongzc)

[ZonaHex](https://github.com/ZonaHex)

[zyy17](https://github.com/zyy17)