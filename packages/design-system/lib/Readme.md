# File organization

The components are split into three categories, Components, Groups, and Pages.

## Components

Should have no business logic and should be agnostic of the surrounding app using them.
A button is a prime example, as it could be used in any app, its use change on its props.
Same for the "Feed" component, which uses only basic elements.

## Groups

The groups are elements which uses multiple Components, and serve a business-logic purpose.
For example, the "Feed Header" serve a specific component or use.

## Pages

The pages are the layout and templating of various groups or components to offer a web-application
functionnality.
