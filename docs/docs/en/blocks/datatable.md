# Data Table Block


**1. Technical Objective:**

The "Data Table Block" is designed to display and manipulate structured data within a tabular format on a user interface. It supports functionalities such as data listing, sorting, pagination, and executing actions on data entries. The block can handle both static and dynamic data sources, making it adaptable for various applications like user management, transaction overviews, or interactive lists in an application.

**2. Field Descriptions and Explanations:**

**Example 1: Simple Data Table**
- **slug**: Identifier for the data table block.
- **data**: An array of objects representing each row in the table. Each object contains properties that correspond to the table columns.
- **columns**: An array defining the structure and headings of the table:
  - **label**: The visible column header text.
  - **key**: The key that matches with data properties to display in each column.
  - **type**: Data type expected in the column, which helps in rendering and formatting the column data appropriately.

**Example 2: Configurable Data Table with Actions**
- **slug**: Identifier for the data table block.
- **columns**: Defines multiple columns, including special columns for actions such as delete:
  - **label**: Column header label.
  - **key**: Data key for matching column data.
  - **type**: Defines the data type (e.g., string).
  - **actions**: Optional actions that can be taken from this column, like deleting a row.
- **config**: Additional configuration settings:
  - **customProps**: Custom properties like loading indicators.
  - **title**: Title of the table in multiple languages.
  - **onInit**: Event triggered when the table is initialized.
  - **updateOn**: Event to trigger data updates.
- **data**: Placeholder for data, expecting to be filled by an automation or dynamic source.

**Example 3: Complex Table with Pagination and Bulk Actions**
- **slug**: Identifier for the data table block.
- **data**: Dynamically linked data entries from a template or a collection.
- **columns**: Template-driven or dynamically defined columns.
- **pagination**: Controls for navigating through pages of data:
  - **event**: Event triggered for pagination.
  - **payload**: Details to fetch specific page data.
  - **page**: Current page number.
  - **itemCount**: Total number of items in the dataset.
  - **pageSize**: Number of items per page.
- **onSort**: Event and payload definitions for sorting the table data.
- **bulkActions**: Actions that can be applied to multiple selected items:
  - **label**: Text label for the action in multiple languages.
  - **onSelect**: Event and payload to execute when the action is selected.

**3. Yaml files (See code section):**

**Example 1: Static data table**
```yaml
slug: DataTable
data:
  - name: John doe
    email: john@doe.com
  - name: Marie France
    email: marie@france.com
columns:
  - label: Name
    key: name
    type: string
  - label: Email
    key: email
```
This table displays a static list of names and emails with simple column configurations, ideal for uncomplicated datasets where no additional actions or configurations are necessary.

**Example 2: Dynamic data table **
```yaml
slug: DataTable
columns:
  - label: Id
    key: id
    type: string
  - label: Created
    key: created
    type: string
  - label: Name
    key: name
    type: string
  - label: Attachment
    key: attachment
    type: string
  - label: Actions
    actions:
      - label: Delete
        action:
          type: event
          value: deleteData
          payload:
            id: ${id}
config:
  customProps:
    loading: true
  title:
    fr: Data
    en: Data
  onInit: initData
  updateOn: updateData
data:
  - {}
```
This configuration outlines a dynamic data table capable of interacting with backend services to fetch, update, and manipulate data. It includes loading states and actions for individual data manipulation such as deletion.

**Example 3: Complex data table**
```yaml
slug: DataTable
data: '{{collection.lines.list}}'
columns: '{{collection.columns}}'
pagination:
  event: paginate collection
  payload:
    id: '{{collection._id}}'
  page: '{{filters.page}}'
  itemCount: '{{collection.lines.total}}'
  pageSize: 50
onSort:
  event: sort collection
  payload:
    id: '{{collection._id}}'
    page: '{{filters.page}}'
bulkActions:
  - label:
      fr: Supprimer
      en: Delete
    onSelect:
      event: bulk delete
      payload:
        collectionId: '{{collection