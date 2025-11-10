const VersionNameGen = require("./VersionNameGen");
const GitRevisionPlugin = require('git-revision-webpack-plugin');

const editorUrls = [
  "https://app.roll20.net/editor",
  "https://app.roll20.net/editor/",
  "https://app.roll20.net/editor/#*", // handle all fragments
  "https://app.roll20.net/editor#*",
  "https://app.roll20.net/editor/?*", // handle all queries
  "https://app.roll20.net/editor?*"
];

const gen = (browser, origVersionName) => {
  const isChrome = browser.id === "chrome";
  const hostPermissions = [
    '*://app.roll20.net/editor*',
    '*://cdn.roll20.net/*',
  ];

  const webAccessibleResources = [
    '*.tsx',
    '*.ts',
    '*.js',
    '*.css',
    'logo.svg',
    '*.png',
    '*.webm'
  ];

  let manifest = {
    manifest_version: isChrome ? 3 : 2,
    name: 'VTT Enhancement Suite',
    version: VersionNameGen(origVersionName),
    description: 'aka R20ES. Provides quality-of-life and workflow speed improvements to Roll20.',

    icons: {
      "16": "logo16.png",
      "48": "logo48.png",
      "96": "logo96.png",
      "128": "logo128.png"
    },
    content_scripts: [
      {
        matches: editorUrls,
        js: [
          'ContentScript.js'
        ]
      },

      {
        matches: editorUrls,
        js: [
          "EarlyContentScript.js",
        ],
        run_at: "document_start"
      },
    ],
    background: isChrome
      ? {
        service_worker: 'Background.js'
      }
      : {
        scripts: [
          'Background.js'
        ]
      },

    browser_specific_settings: {
      gecko: {
        id: '{ffed5dfa-f0e1-403d-905d-ac3f698660a7}',
      }
    },

    web_accessible_resources: isChrome
      ? [
        {
          resources: webAccessibleResources,
          matches: [
            'https://app.roll20.net/*',
            'https://cdn.roll20.net/*',
          ],
        }
      ]
      : webAccessibleResources
  }

  if (isChrome) {
    manifest.host_permissions = hostPermissions;
    manifest.permissions = [
      'webRequest',
      'webRequestBlocking',
      'storage',
    ];
  }
  else {
    manifest.permissions = [
      ...hostPermissions,
      'webRequest',
      'webRequestBlocking',
      'storage',
    ];
  }

  if (browser.id === "chrome") {
    manifest.version_name = origVersionName;
  }

  return Object.assign(manifest, browser.manifest);
}

module.exports = gen;
