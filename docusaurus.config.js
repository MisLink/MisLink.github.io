// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/nightOwlLight")
const darkCodeTheme = require("prism-react-renderer/themes/nightOwl")
const math = require("remark-math")
const katex = require("rehype-katex")

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Opstio",
  tagline: "",
  favicon: "img/favicon.ico",

  url: "https://blog.uoiai.me",
  baseUrl: "/",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "zh-Hans",
    locales: ["zh-Hans"],
  },

  stylesheets: [
    {
      href: "/katex/katex-0.16.6.min.css",
      type: "text/css",
    },
  ],

  plugins: [require.resolve("docusaurus-lunr-search")],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: {
          routeBasePath: "/",
          showReadingTime: true,
          blogSidebarCount: 0,
          remarkPlugins: [math],
          rehypePlugins: [katex],
          feedOptions: {
            type: "all",
            createFeedItems: async (params) => {
              const { blogPosts, defaultCreateFeedItems, ...rest } = params
              return defaultCreateFeedItems({
                blogPosts: blogPosts.filter((item, index) => index < 20),
                ...rest,
              })
            },
          },
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
      navbar: {
        title: "Opstio",
        logo: {
          alt: "Opstio Logo",
          src: "img/logo.png",
        },
        items: [
          {
            label: "所有文章",
            position: "left",
            href: "archive",
          },
          {
            label: "标签",
            position: "left",
            href: "tags",
          },
          {
            label: "关于",
            position: "left",
            href: "about",
          },
          {
            label: "RSS",
            href: "atom.xml",
            position: "right",
            target: "_blank",
          },
          {
            label: "联系我",
            position: "right",
            type: "dropdown",
            items: [
              {
                label: "Github",
                href: "https://github.com/MisLink",
              },
              {
                label: "Email",
                href: "mailto:gjq.uoiai@outlook.com",
              },
            ],
          },
          {
            type: "search",
            position: "right",
          },
        ],
      },
      footer: {
        style: "light",
        copyright: `如无特别说明，所有作品采用<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">知识共享署名-相同方式共享 4.0 国际许可协议</a>进行许可。`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ["haskell"],
      },
    }),
}

module.exports = config
