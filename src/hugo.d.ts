interface Window {
  DEFAULT_TITLE: string
}

type PageObjectData = {
  "Kind": string // "page",
  "Pages": any // null,
  "Resources": any // null,
  "Content": string // "<p>Loaded from JSON version.</p>\n\n<p>Hello</p>\n",
  "Summary": string // "Loaded from JSON version.\nHello",
  "TableOfContents": string // "",
  "Aliases": any // null,
  "Images": any // null,
  "Videos": any // null,
  "Truncated": boolean // false,
  "Draft": boolean // true,
  "Status": string // "",
  "PublishDate": string // "2018-02-11T15:45:14-06:00",
  "ExpiryDate": string // "0001-01-01T00:00:00Z",
  "Weight": number // 0,
  "Markup": string // "markdown",
  "Layout": string // "",
  "Frontmatter": any // null,
  "File": {
    "ReadableFile": {}
  },
  "GitInfo": any // null,
  "Description": string // "",
  "Keywords": string[] // [],
  "Data": {
    "Pages": any // null
  },
  "Date": string // "2018-02-11T15:45:14-06:00",
  "Lastmod": string // "2018-02-11T15:45:14-06:00",
  "Sitemap": {
    "ChangeFreq": string // "",
    "Priority": number // -1,
    "Filename": string // "sitemap.xml"
  },
  "URL": string // "",
  "Permalink": string // "",
  "Slug": string // "",
  "Section": string // ""
}

type PageObject = {
  Title: string
  DatePublished: string
  Data: PageObjectData
}