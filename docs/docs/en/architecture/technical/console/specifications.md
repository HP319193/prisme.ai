# Description

Console is a web-app targeted to App builders and Endusers which help to create and use workspaces, automations and applications.

It runs on every modern browser up to date (Chrome, Firefox, Safari, Edge).

A user account is needed to access the service.

# Technical stack

<table style="width:100%;">
<colgroup>
<col style="width: 10%" />
<col style="width: 80%" />
<col style="width: 10%" />
</colgroup>
<tbody>
<tr class="odd">
  <td style="text-align: left;"><p>Library</p></td>
  <td style="text-align: left;"><p>Usage</p></td>
  <td style="text-align: left;"><p>Version</p></td>
</tr>
<tr class="even">
  <td><a href="https://www.typescriptlang.org/">Typescript</a></td>
  <td>Language</td>
  <td>4.5.2</td>
</tr>
<tr class="odd">
  <td><a href="https://www.react.org/">React</a></td>
  <td>VDOM library</td>
  <td>17</td>
</tr>
<tr class="even">
  <td><a href="https://nextjs.org">Next</a></td>
  <td>Framework</td>
  <td>12</td>
</tr>
<tr class="odd">
<td><a href="https://github.com/isaachinman/next-i18next">next-i18next</a></td>
  <td>Internationalization utility</td>
  <td>10</td>
</tr>
<tr class="odd">
  <td><a href="https://final-form.org/">final-form</a></td>
  <td>Forms management</td>
  <td>4</td>
</tr>
<tr class="even">
  <td><a href="https://socket.io/">socket.io</a></td>
  <td>WebSocket</td>
  <td>4</td>
</tr>
</tbody>
</table>

The web app is built on top of [typescript](https://www.typescriptlang.org/) language and [React](https://reactjs.org/)/[NextJS](https://nextjs.org/) framework.

Through NextJS, the app is dynamically routed and some pages can be rendered on server side for SEO and caching.

Internationalization is managed by [i18next](https://www.i18next.com/). Translations are located in public/:lang folder under many json files.  
Languages supported are english, french and spanish. English is the default language.

Forms are managed by [final-form](https://final-form.org/).

Realtime connexion with EDA uses socket.io library.

App states are managed by React context API with thematic Providers.

# Design

The console should be responsive, usable on width > 768px. On smaller devices, some functionalities may not be available. An explication will be displayed to let user knows what he could do on a bigger screen.

The features should have accessibility in mind. Main functionalities should be usable with keyboard and readable with a screen reader.

## Performance

Run Lighthouse to check for performance, best practices, accessibility, and SEO. For best results, use a production build of Next.js and use incognito in your browser so results aren't affected by extensions.

Lighthouse's results must be green.

# Quality

## Development and quality standards

- At least 70% test coverage
- Maximum 3 % duplicated code

## Tests

All components have a minimum snapshot test. Complex components have as many snapshots than different possible states. Utils have unit tests.

<table style="width:100%;">
<colgroup>
<col style="width: 10%" />
<col style="width: 10%" />
<col style="width: 10%" />
<col style="width: 50%" />
</colgroup>
<tbody>
<tr class="odd">
<td style="text-align: left;"><p>Tests</p></td>
<td style="text-align: left;"><p>Minimal coverage rate</p></td>
<td style="text-align: left;"><p>Details</p></td>
</tr>
<tr class="even">
<td style="text-align: left;">Unit tests</td>
<td style="text-align: left;">At least 70%</td>
<td style="text-align: left;">N/A</td>
</tr>
<tr class="even">
<td style="text-align: left;">Snapshot tests</td>
<td style="text-align: left;">At least 70%</td>
<td style="text-align: left;">All components have a minimum snapshot test. Complex components have as many snapshots than different possible states.</td>
</tr>
<tr class="even">
<td style="text-align: left;">E2E</td>
<td style="text-align: left;">30%</td>
<td style="text-align: left;">N/A</td>
</tr>
</tbody>
</table>

## Logs

No log must appears in user's console.

## Errors

Unexpected errors are sent to sentry.

# Security

App only read path which is parsed by NextJS. XSS attack should not be possible.

Authenticated user token is stored in local storage.

# Company Social Responsibility (CSR)

- Use lazy loading for occasional resource loading
- Limit databases results with pagination
- Group massive processing into more effective batches

# Hosting

Dockerfile, docker-compose and Helm chart ready to use.

# Linting

The code should be formatted using Prettier, using the version specified in the package.json
