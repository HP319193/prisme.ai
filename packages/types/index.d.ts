declare namespace Prismeai {
    export interface All {
        /**
         * Execute each instruction in parallel. Pause current automation execution until all instructions are processed.
         */
        all: Instruction[];
    }
    export type AllEventRequests = (GenericErrorEvent | FailedLogin | SucceededLogin | ExecutedAutomation | UpdatedContexts | CreatedWorkspace | UpdatedWorkspace | DeletedWorkspace | InstalledAppInstance | UninstalledAppInstance | ConfiguredAppInstance | CreatedAutomation | UpdatedAutomation | DeletedAutomation | CreatedPage | UpdatedPage | DeletedPage | AppEvent)[];
    export type AllEventResponses = (PrismeEvent | {
        /**
         * example:
         * error
         */
        type: string;
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload: AnyValue;
        error?: {
            [name: string]: any;
            error?: string;
            message: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
    } | {
        /**
         * example:
         * gateway.login.failed
         */
        type: "gateway.login.failed";
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload: AnyValue;
        error?: {
            error?: string;
            message?: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
    } | {
        /**
         * example:
         * gateway.login.succeeded
         */
        type: "gateway.login.succeeded";
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload: AnyValue;
        error?: {
            error?: string;
            message?: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
    } | {
        /**
         * example:
         * runtime.automations.executed
         */
        type: "runtime.automations.executed";
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload: AnyValue;
        error?: {
            error?: string;
            message?: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
    } | {
        /**
         * example:
         * runtime.contexts.updated
         */
        type: "runtime.contexts.updated";
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload: AnyValue;
        error?: {
            error?: string;
            message?: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
    } | {
        /**
         * example:
         * workspaces.created
         */
        type: "workspaces.created";
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload: AnyValue;
        error?: {
            error?: string;
            message?: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
    } | {
        /**
         * example:
         * workspaces.updated
         */
        type: "workspaces.updated";
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload: AnyValue;
        error?: {
            error?: string;
            message?: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
    } | {
        /**
         * example:
         * workspaces.deleted
         */
        type: "workspaces.deleted";
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload: AnyValue;
        error?: {
            error?: string;
            message?: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
    } | {
        /**
         * example:
         * apps.someApp.someCustomEvent
         */
        type: string;
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload?: AnyValue;
        error?: {
            error?: string;
            message?: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
        /**
         * App unique id
         */
        appSlug: string;
        /**
         * App name
         */
        appName?: string;
        /**
         * Defaults to the latest known app version
         */
        appVersion?: string;
        config?: any;
        /**
         * Unique & human readable id across current workspace's appInstances, which will be used to call this app automations
         */
        slug?: string;
    } | {
        /**
         * example:
         * workspaces.apps.configured
         */
        type: "workspaces.apps.configured";
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload: AnyValue;
        error?: {
            error?: string;
            message?: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
    } | {
        /**
         * example:
         * workspaces.apps.installed
         */
        type: "workspaces.apps.installed";
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload: AnyValue;
        error?: {
            error?: string;
            message?: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
    } | {
        /**
         * example:
         * workspaces.apps.uninstalled
         */
        type: "workspaces.apps.uninstalled";
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload: AnyValue;
        error?: {
            error?: string;
            message?: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
    } | {
        /**
         * example:
         * workspaces.automations.created
         */
        type: "workspaces.automations.created";
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload: AnyValue;
        error?: {
            error?: string;
            message?: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
    } | {
        /**
         * example:
         * workspaces.automations.updated
         */
        type: "workspaces.automations.updated";
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload: AnyValue;
        error?: {
            error?: string;
            message?: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
    } | {
        /**
         * example:
         * workspaces.automations.deleted
         */
        type: "workspaces.automations.deleted";
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload: AnyValue;
        error?: {
            error?: string;
            message?: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
    } | {
        /**
         * example:
         * workspaces.pages.created
         */
        type: "workspaces.pages.created";
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload: AnyValue;
        error?: {
            error?: string;
            message?: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
    } | {
        /**
         * example:
         * workspaces.pages.updated
         */
        type: "workspaces.pages.updated";
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload: AnyValue;
        error?: {
            error?: string;
            message?: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
    } | {
        /**
         * example:
         * workspaces.pages.deleted
         */
        type: "workspaces.pages.deleted";
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload: AnyValue;
        error?: {
            error?: string;
            message?: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
    })[];
    export type AnyValue = any;
    export interface ApiKey {
        apiKey: string;
        subjectType: string;
        subjectId: string;
        rules: ApiKeyRules;
    }
    export interface ApiKeyRules {
        events?: {
            /**
             * example:
             * [
             *   "allowedEvent1",
             *   "allowedEvent2"
             * ]
             */
            types?: string[];
        };
        uploads?: {
            /**
             * example:
             * [
             *   "image/*",
             *   "audio/*"
             * ]
             */
            mimetypes?: string[];
        };
    }
    export interface App {
        workspaceId: string;
        versions?: string[];
        name?: string;
        description?: LocalizedText;
        photo?: string;
        slug?: string;
    }
    export interface AppDetails {
        config?: Config;
        blocks: {
            slug: string;
            url?: string;
            edit?: TypedArgument;
            name?: LocalizedText;
            description?: LocalizedText;
            arguments?: {
                [name: string]: TypedArgument;
            };
        }[];
        automations: {
            slug: string;
            name: LocalizedText;
            description?: LocalizedText;
        }[];
        photo?: string;
    }
    export interface AppEvent {
        /**
         * example:
         * someCustomEvent
         */
        type: string;
        payload: AnyValue;
    }
    export interface AppInstance {
        /**
         * App unique id
         */
        appSlug: string;
        /**
         * App name
         */
        appName?: string;
        /**
         * Defaults to the latest known app version
         */
        appVersion?: string;
        config?: any;
        /**
         * Unique & human readable id across current workspace's appInstances, which will be used to call this app automations
         */
        slug?: string;
    }
    export type AppInstanceDetailedList = DetailedAppInstance[];
    export interface AppInstancePatch {
        /**
         * App unique id
         */
        appSlug?: string;
        /**
         * App name
         */
        appName?: string;
        /**
         * Defaults to the latest known app version
         */
        appVersion?: string;
        config?: any;
        /**
         * Unique & human readable id across current workspace's appInstances, which will be used to call this app automations
         */
        slug?: string;
    }
    export interface AuthenticationError {
        /**
         * example:
         * AuthenticationError
         */
        error?: string;
        /**
         * example:
         * Unauthenticated
         */
        message?: string;
    }
    /**
     * Full description at (TODO swagger url)
     */
    export interface Automation {
        when?: When;
        description?: LocalizedText;
        arguments?: {
            [name: string]: TypedArgument;
        };
        do: InstructionList;
        /**
         * Automation result expression. Might be a variable reference, an object/array with variables inside ...
         * example:
         * {{result}}
         */
        output?: any;
        /**
         * Set this to true if you don't want your automation to be accessible outside of your app. Default is false.
         * example:
         * false
         */
        private?: any;
        /**
         * Set this to true if you want to turn off this automation.
         * example:
         * true
         */
        disabled?: boolean;
        name: LocalizedText;
        /**
         * Unique & human readable id across current workspace's automations
         */
        slug?: string;
    }
    export interface AutomationResult {
        slug: string;
        output?: AnyValue;
    }
    export interface BadParametersError {
        /**
         * example:
         * BadParameters
         */
        error?: string;
        message?: string;
        details?: {
            [key: string]: any;
        }[];
    }
    /**
     * Block
     */
    export interface Block {
        description?: LocalizedText;
        name?: LocalizedText;
        url: string;
        edit?: TypedArgument;
    }
    export interface Break {
        /**
         * Stop current automation execution. Have one option that allow a break to break all parent automations.
         */
        break: {
            /**
             * The scope argument defines in which scope the break will take effect. It only breaks the current automation by default, it can also break all parent automations. More options might become available in the future.
             */
            scope?: "all" | "automation";
        };
    }
    export interface Comment {
        /**
         * Do nothing but display a comment in instructions list
         */
        comment: string;
    }
    export interface Conditions {
        [name: string]: InstructionList;
        default: InstructionList;
    }
    export interface Config {
        schema?: {
            [name: string]: TypedArgument;
        };
        block?: string;
        value?: any;
    }
    export interface ConfiguredAppInstance {
        /**
         * example:
         * workspaces.apps.configured
         */
        type: "workspaces.apps.configured";
        payload: {
            appInstance: AppInstance;
            slug: string;
            /**
             * Filled with the previous appInstance slug when renamed
             */
            oldSlug?: string;
        };
    }
    export interface ConfiguredWorkspace {
        /**
         * example:
         * workspaces.configured
         */
        type: "workspaces.configured";
        payload: {
            config: Config;
        };
    }
    export interface Contact {
        /**
         * Name
         */
        firstName: string;
        /**
         * Name
         */
        lastName?: string;
        /**
         * Profile picture URL
         */
        photo?: string;
        /**
         * Unique id
         */
        id?: string;
    }
    export interface CreatedApiKey {
        /**
         * example:
         * apikeys.created
         */
        type: "apikeys.created";
        payload: {
            apiKey: string;
            subjectType: "workspaces" | "pages";
            subjectId: string;
            rules: ApiKeyRules;
        };
    }
    export interface CreatedAutomation {
        /**
         * example:
         * workspaces.automations.created
         */
        type: "workspaces.automations.created";
        payload: {
            slug: string;
            automation: /* Full description at (TODO swagger url) */ Automation;
        };
    }
    export interface CreatedPage {
        /**
         * example:
         * workspaces.pages.created
         */
        type: "workspaces.pages.created";
        payload: {
            page: /* Page */ Page;
        };
    }
    export interface CreatedWorkspace {
        /**
         * example:
         * workspaces.created
         */
        type: "workspaces.created";
        payload: {
            workspace: Workspace;
        };
    }
    export interface DSUL {
        name: string;
        description?: LocalizedText;
        photo?: string;
        owner?: {
            id?: string;
        };
        imports?: {
            [name: string]: AppInstance;
        };
        config?: Config;
        automations?: {
            [name: string]: /* Full description at (TODO swagger url) */ Automation;
        };
        blocks?: {
            [name: string]: /* Block */ Block;
        };
        createdAt?: string;
        updatedAt?: string;
        id?: string;
    }
    export interface Delete {
        delete: {
            /**
             * Variable name to remove
             */
            name: string;
        };
    }
    export interface DeletedApiKey {
        /**
         * example:
         * apikeys.deleted
         */
        type: "apikeys.deleted";
        payload: {
            apiKey: string;
            subjectType: "workspaces" | "pages";
            subjectId: string;
        };
    }
    export interface DeletedApp {
        /**
         * example:
         * apps.deleted
         */
        type: "apps.deleted";
        payload: {
            appSlug: string;
        };
    }
    export interface DeletedAutomation {
        /**
         * example:
         * workspaces.automations.deleted
         */
        type: "workspaces.automations.deleted";
        payload: {
            automation: {
                slug: string;
                name: LocalizedText;
            };
        };
    }
    export interface DeletedPage {
        /**
         * example:
         * workspaces.pages.deleted
         */
        type: "workspaces.pages.deleted";
        payload: {
            page: /* Page */ Page;
        };
    }
    export interface DeletedWorkspace {
        /**
         * example:
         * workspaces.deleted
         */
        type: "workspaces.deleted";
        payload: {
            workspaceId: string;
        };
    }
    export interface DetailedAppInstance {
        /**
         * App unique id
         */
        appSlug: string;
        /**
         * App name
         */
        appName?: string;
        /**
         * Defaults to the latest known app version
         */
        appVersion?: string;
        config?: Config;
        /**
         * Unique & human readable id across current workspace's appInstances, which will be used to call this app automations
         */
        slug?: string;
        blocks: {
            slug: string;
            url?: string;
            edit?: TypedArgument;
            name?: LocalizedText;
            description?: LocalizedText;
            arguments?: {
                [name: string]: TypedArgument;
            };
        }[];
        automations: {
            slug: string;
            name: LocalizedText;
            description?: LocalizedText;
        }[];
        photo?: string;
    }
    /**
     * Page
     */
    export interface DetailedPage {
        name: LocalizedText;
        description?: LocalizedText;
        workspaceId?: string;
        blocks: {
            name?: string;
            config?: {
                [name: string]: any;
            };
            url?: string;
            appInstance?: string;
        }[];
        id?: string;
        slug?: string;
        styles?: string;
        createdBy?: string;
        updatedBy?: string;
        createdAt?: string;
        updatedAt?: string;
        permissions?: PermissionsMap;
    }
    export interface Emit {
        emit: {
            /**
             * example:
             * prismeaiMessenger.message
             */
            event: string;
            payload?: AnyValue;
        };
    }
    export interface ExecutedAutomation {
        /**
         * example:
         * runtime.automations.executed
         */
        type: "runtime.automations.executed";
        payload: {
            slug: string;
            payload: {
                [key: string]: any;
            };
            output: AnyValue;
            duration: number;
        };
    }
    export interface FailedFetch {
        /**
         * example:
         * runtime.fetch.failed
         */
        type: "runtime.fetch.failed";
        payload: {
            /**
             * Send an HTTP request
             */
            request: {
                url: string;
                method?: "get" | "post" | "put" | "patch" | "delete";
                headers?: {
                    [name: string]: string;
                };
                /**
                 * HTTP request body
                 */
                body?: AnyValue;
                /**
                 * Name of the variable which will hold the result
                 */
                output?: string;
            };
            response: {
                status: number;
                body: any;
                headers: {
                    [key: string]: any;
                };
            };
        };
    }
    export interface FailedLogin {
        /**
         * example:
         * gateway.login.failed
         */
        type: "gateway.login.failed";
        payload: {
            ip: string;
            email: string;
        };
    }
    export interface Fetch {
        /**
         * Send an HTTP request
         */
        fetch: {
            url: string;
            method?: "get" | "post" | "put" | "patch" | "delete";
            headers?: {
                [name: string]: string;
            };
            /**
             * HTTP request body
             */
            body?: AnyValue;
            /**
             * Name of the variable which will hold the result
             */
            output?: string;
        };
    }
    export interface File {
        name: string;
        url: string;
        mimetype: string;
        size: number;
        workspaceId: string;
        path: string;
        expiresAt?: string;
        /**
         * Number of seconds after which the file will be automatically removed
         */
        expiresAfter?: number;
        metadata?: {
            [name: string]: any;
        };
    }
    export interface ForbiddenError {
        /**
         * example:
         * ForbiddenError
         */
        error?: string;
        /**
         * example:
         * Forbidden
         */
        message?: string;
    }
    export interface FulfilledWait {
        /**
         * example:
         * runtime.waits.fulfilled.{{id}}
         */
        type: "runtime.waits.fulfilled.{{id}}";
        payload: {
            id?: string;
            event: PrismeEvent;
        };
    }
    export interface GenericError {
        /**
         * example:
         * ObjectNotFound
         */
        error?: string;
        message?: string;
        details?: AnyValue;
    }
    export interface GenericErrorEvent {
        /**
         * example:
         * error
         */
        type: string;
        error?: {
            [name: string]: any;
            message: string;
        };
    }
    export interface InstalledAppInstance {
        /**
         * example:
         * workspaces.apps.installed
         */
        type: "workspaces.apps.installed";
        payload: {
            appInstance: AppInstance;
            slug: string;
        };
    }
    export type Instruction = Emit | Wait | Set | Delete | Conditions | Repeat | All | Break | Fetch | Comment | {
        [name: string]: any;
    };
    export type InstructionList = Instruction[];
    export type LocalizedText = {
        [name: string]: string;
    } | string;
    export interface Object {
        /**
         * Unique id
         */
        id?: string;
    }
    export interface ObjectNotFoundError {
        /**
         * example:
         * ObjectNotFound
         */
        error?: string;
        message?: string;
    }
    /**
     * Page
     */
    export interface Page {
        name: LocalizedText;
        description?: LocalizedText;
        workspaceId?: string;
        blocks: {
            name?: string;
            config?: {
                [name: string]: any;
            };
        }[];
        id?: string;
        slug?: string;
        styles?: string;
        createdBy?: string;
        updatedBy?: string;
        createdAt?: string;
        updatedAt?: string;
        permissions?: PermissionsMap;
    }
    export interface PagePermissionsDeleted {
        /**
         * example:
         * workspaces.pages.permissions.deleted
         */
        type: "workspaces.pages.permissions.deleted";
        payload: {
            subjectId: string;
            userId: string;
        };
    }
    export interface PagePermissionsShared {
        /**
         * example:
         * workspaces.pages.permissions.shared
         */
        type: "workspaces.pages.permissions.shared";
        payload: {
            subjectId: string;
            permissions: UserPermissions;
        };
    }
    export interface PendingWait {
        /**
         * example:
         * runtime.waits.pending
         */
        type: "runtime.waits.pending";
        payload: {
            id: string;
            expiresAt: number;
            wait: Wait.Properties.Wait;
        };
    }
    /**
     * example:
     * [
     *   {
     *     "email": "admin@prisme.ai",
     *     "role": "admin"
     *   },
     *   {
     *     "email": "readonly@prisme.ai",
     *     "policies": {
     *       "read": true
     *     }
     *   },
     *   {
     *     "public": true,
     *     "policies": {
     *       "read": true
     *     }
     *   }
     * ]
     */
    export type PermissionsList = UserPermissions[];
    export interface PermissionsMap {
        [name: string]: {
            role?: Role;
            policies?: Policies;
        };
    }
    export interface Policies {
        read?: boolean;
        write?: boolean;
        update?: boolean;
        create?: boolean;
        manage_permissions?: boolean;
    }
    export interface PrismeEvent {
        /**
         * example:
         * apps.someApp.someCustomEvent
         */
        type: string;
        source: {
            appSlug?: string;
            appInstanceFullSlug?: string;
            appInstanceDepth?: number;
            automationSlug?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            topic?: string;
        };
        payload?: AnyValue;
        error?: {
            error?: string;
            message?: string;
            details?: AnyValue;
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        /**
         * Creation date (ISO8601)
         */
        createdAt: string;
        id: string;
    }
    export interface PublishedApp {
        /**
         * example:
         * apps.published
         */
        type: "apps.published";
        payload: {
            app: App;
        };
    }
    export interface Repeat {
        /**
         * One of "on" or "until" is required
         */
        repeat: /* One of "on" or "until" is required */ {
            on: string;
            do: InstructionList;
        } | {
            until: number;
            do: InstructionList;
        };
    }
    export type Role = "owner" | "editor";
    export interface Set {
        set: {
            /**
             * Variable name, might be "foo", "session.sessionScopedFoo", "global.globalScopedFoo", "user.userScopedFoo", ...
             */
            name: string;
            /**
             * variable value
             */
            value: AnyValue;
        };
    }
    export interface SucceededLogin {
        /**
         * example:
         * gateway.login.succeeded
         */
        type: "gateway.login.succeeded";
        payload: {
            ip: string;
            email: string;
            id: string;
        };
    }
    export interface TriggeredWebhook {
        /**
         * example:
         * runtime.webhooks.triggered
         */
        type: "runtime.webhooks.triggered";
        payload: {
            workspaceId: string;
            automationSlug: string;
            /**
             * example:
             * post
             */
            method: string;
            headers: {
                [key: string]: any;
            };
            query: {
                [key: string]: any;
            };
            body: {
                [key: string]: any;
            };
        };
    }
    export interface TypedArgument {
        type?: "string" | "number" | "object" | "array" | "boolean";
        description?: LocalizedText;
        items?: TypedArgument;
        "ui:widget"?: string;
        "ui:options"?: {
            [key: string]: any;
        };
    }
    export interface UninstalledAppInstance {
        /**
         * example:
         * workspaces.apps.uninstalled
         */
        type: "workspaces.apps.uninstalled";
        payload: {
            appInstance: AppInstance;
            slug: string;
        };
    }
    export interface UpdatedApiKey {
        /**
         * example:
         * apikeys.updated
         */
        type: "apikeys.updated";
        payload: {
            apiKey: string;
            subjectType: "workspaces" | "pages";
            subjectId: string;
            rules: ApiKeyRules;
        };
    }
    export interface UpdatedAutomation {
        /**
         * example:
         * workspaces.automations.updated
         */
        type: "workspaces.automations.updated";
        payload: {
            automation: /* Full description at (TODO swagger url) */ Automation;
            slug: string;
            /**
             * Filled with the previous automation slug when renamed
             */
            oldSlug?: string;
        };
    }
    export interface UpdatedContexts {
        /**
         * example:
         * runtime.contexts.updated
         */
        type: "runtime.contexts.updated";
        payload: {
            contexts: {
                [key: string]: any;
            };
        };
    }
    export interface UpdatedPage {
        /**
         * example:
         * workspaces.pages.updated
         */
        type: "workspaces.pages.updated";
        payload: {
            page: /* Page */ Page;
        };
    }
    export interface UpdatedWorkspace {
        /**
         * example:
         * workspaces.updated
         */
        type: "workspaces.updated";
        payload: {
            workspace: Workspace;
        };
    }
    export interface User {
        /**
         * example:
         * foo@prisme.ai
         */
        email?: string;
        authData?: {
            [name: string]: any;
            facebook?: {
                [key: string]: any;
            };
        };
        /**
         * Name
         */
        firstName: string;
        /**
         * Name
         */
        lastName?: string;
        /**
         * Profile picture URL
         */
        photo?: string;
        /**
         * Unique id
         */
        id?: string;
    }
    export type UserPermissions = {
        email: string;
        id?: string;
        public?: boolean;
        role?: Role;
        policies?: Policies;
    } | {
        email?: string;
        id?: string;
        public: boolean;
        role?: Role;
        policies?: Policies;
    };
    export interface Wait {
        wait: {
            oneOf: {
                /**
                 * example:
                 * prismeaiMessenger.message
                 */
                event: string;
                /**
                 * Only match the next event fulfilling these filters. Multiple filters will be joined with an 'AND' operator
                 * example:
                 * {
                 *   "automationSlug": "someId",
                 *   "someObjectField.someNestedField": "foo"
                 * }
                 */
                filters?: {
                    [name: string]: string;
                };
                /**
                 * If true, do not send this event to the the usual triggers
                 */
                cancelTriggers?: boolean;
            }[];
            /**
             * After N seconds, timeout & outputs an empty result. Defaults to 20
             */
            timeout?: number;
            /**
             * Will save the caught event inside this variable
             * example:
             * nameOfResultVariable
             */
            output?: string;
        };
    }
    namespace Wait {
        namespace Properties {
            export interface Wait {
                oneOf: {
                    /**
                     * example:
                     * prismeaiMessenger.message
                     */
                    event: string;
                    /**
                     * Only match the next event fulfilling these filters. Multiple filters will be joined with an 'AND' operator
                     * example:
                     * {
                     *   "automationSlug": "someId",
                     *   "someObjectField.someNestedField": "foo"
                     * }
                     */
                    filters?: {
                        [name: string]: string;
                    };
                    /**
                     * If true, do not send this event to the the usual triggers
                     */
                    cancelTriggers?: boolean;
                }[];
                /**
                 * After N seconds, timeout & outputs an empty result. Defaults to 20
                 */
                timeout?: number;
                /**
                 * Will save the caught event inside this variable
                 * example:
                 * nameOfResultVariable
                 */
                output?: string;
            }
        }
    }
    export type When = {
        /**
         * example:
         * [
         *   "prismeaiMessenger.event"
         * ]
         */
        events: string[];
        /**
         * example:
         * [
         *   "2021-12-25T00:00",
         *   "* * 1 * *"
         * ]
         */
        dates?: string[];
        endpoint?: boolean | string;
    } | {
        /**
         * example:
         * [
         *   "prismeaiMessenger.event"
         * ]
         */
        events?: string[];
        /**
         * example:
         * [
         *   "2021-12-25T00:00",
         *   "* * 1 * *"
         * ]
         */
        dates: string[];
        endpoint?: boolean | string;
    } | {
        /**
         * example:
         * [
         *   "prismeaiMessenger.event"
         * ]
         */
        events?: string[];
        /**
         * example:
         * [
         *   "2021-12-25T00:00",
         *   "* * 1 * *"
         * ]
         */
        dates?: string[];
        endpoint: boolean | string;
    };
    export type Workspace = DSUL;
    export interface WorkspacePermissionsDeleted {
        /**
         * example:
         * workspaces.permissions.deleted
         */
        type: "workspaces.permissions.deleted";
        payload: {
            subjectId: string;
            userId: string;
        };
    }
    export interface WorkspacePermissionsShared {
        /**
         * example:
         * workspaces.permissions.shared
         */
        type: "workspaces.permissions.shared";
        payload: {
            subjectId: string;
            permissions: UserPermissions;
        };
    }
}
declare namespace PrismeaiAPI {
    namespace AnonymousAuth {
        namespace Responses {
            export interface $200 {
                /**
                 * example:
                 * foo@prisme.ai
                 */
                email?: string;
                authData?: {
                    [name: string]: any;
                    facebook?: {
                        [key: string]: any;
                    };
                };
                /**
                 * Name
                 */
                firstName: string;
                /**
                 * Name
                 */
                lastName?: string;
                /**
                 * Profile picture URL
                 */
                photo?: string;
                /**
                 * Unique id
                 */
                id?: string;
                token: string;
            }
        }
    }
    namespace AutomationWebhook {
        namespace Parameters {
            export type AutomationSlug = string;
            export interface Query {
                [name: string]: any;
            }
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            automationSlug: Parameters.AutomationSlug;
        }
        export interface QueryParameters {
            query?: Parameters.Query;
        }
        /**
         * Entire body will be passed as a payload to the triggered automation
         */
        export interface RequestBody {
        }
        namespace Responses {
            export type $200 = Prismeai.AnyValue;
            export type $400 = Prismeai.GenericError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace ConfigureAppInstance {
        namespace Parameters {
            export type Slug = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            slug: Parameters.Slug;
        }
        export type RequestBody = Prismeai.AppInstancePatch;
        namespace Responses {
            export type $200 = Prismeai.AppInstance;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace CreateApiKey {
        namespace Parameters {
            export type SubjectId = string;
            export type SubjectType = "workspaces" | "pages";
        }
        export interface PathParameters {
            subjectType: Parameters.SubjectType;
            subjectId: Parameters.SubjectId;
        }
        export interface RequestBody {
            rules: Prismeai.ApiKeyRules;
        }
        namespace Responses {
            export type $200 = Prismeai.ApiKey;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace CreateAutomation {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export type RequestBody = /* Full description at (TODO swagger url) */ Prismeai.Automation;
        namespace Responses {
            export type $200 = /* Full description at (TODO swagger url) */ Prismeai.Automation;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace CreatePage {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export type RequestBody = /* Page */ Prismeai.Page;
        namespace Responses {
            export type $200 = /* Page */ Prismeai.Page;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace CreateWorkspace {
        export type RequestBody = Prismeai.Workspace;
        namespace Responses {
            export type $200 = Prismeai.Workspace;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
        }
    }
    namespace CredentialsAuth {
        export interface RequestBody {
            email: string;
            password: string;
        }
        namespace Responses {
            export interface $200 {
                /**
                 * example:
                 * foo@prisme.ai
                 */
                email?: string;
                authData?: {
                    [name: string]: any;
                    facebook?: {
                        [key: string]: any;
                    };
                };
                /**
                 * Name
                 */
                firstName: string;
                /**
                 * Name
                 */
                lastName?: string;
                /**
                 * Profile picture URL
                 */
                photo?: string;
                /**
                 * Unique id
                 */
                id?: string;
                token: string;
            }
            export type $401 = Prismeai.AuthenticationError;
        }
    }
    namespace DeleteApiKey {
        namespace Parameters {
            export type ApiKey = string;
            export type SubjectId = string;
            export type SubjectType = "workspaces" | "pages";
        }
        export interface PathParameters {
            subjectType: Parameters.SubjectType;
            subjectId: Parameters.SubjectId;
            apiKey: Parameters.ApiKey;
        }
        namespace Responses {
            export interface $200 {
                apiKey?: string;
            }
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace DeleteApp {
        namespace Parameters {
            export type AppSlug = string;
        }
        export interface PathParameters {
            appSlug: Parameters.AppSlug;
        }
        namespace Responses {
            export interface $200 {
                id: string;
            }
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace DeleteAutomation {
        namespace Parameters {
            export type AutomationSlug = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            automationSlug: Parameters.AutomationSlug;
        }
        namespace Responses {
            export interface $200 {
                slug?: string;
            }
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace DeleteFile {
        namespace Parameters {
            export type Id = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            id: Parameters.Id;
        }
        namespace Responses {
            export interface $200 {
                id: string;
            }
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace DeletePage {
        namespace Parameters {
            export type Id = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            id: Parameters.Id;
        }
        namespace Responses {
            export interface $200 {
                id: string;
            }
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace DeleteWorkspace {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        namespace Responses {
            export interface $200 {
                id: string;
            }
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace EventsLongpolling {
        namespace Parameters {
            export type AfterDate = string;
            export type AppInstanceDepth = number;
            export type BeforeDate = string;
            export type BeforeId = string;
            export type Limit = number;
            export type Page = number;
            export interface Query {
                [name: string]: any;
            }
            export type Text = string;
            export type Types = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export interface QueryParameters {
            text?: Parameters.Text;
            beforeId?: Parameters.BeforeId;
            appInstanceDepth?: Parameters.AppInstanceDepth;
            query?: Parameters.Query;
            types?: Parameters.Types;
            afterDate?: Parameters.AfterDate;
            beforeDate?: Parameters.BeforeDate;
            page?: Parameters.Page;
            limit?: Parameters.Limit;
        }
        namespace Responses {
            export interface $200 {
                result?: {
                    events?: Prismeai.AllEventResponses;
                };
            }
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace EventsValues {
        namespace Parameters {
            export type AfterDate = string;
            export type AppInstanceDepth = number;
            export type BeforeDate = string;
            export type BeforeId = string;
            export type Fields = string;
            export type Limit = number;
            export type Page = number;
            export interface Query {
                [name: string]: any;
            }
            export type Text = string;
            export type Types = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export interface QueryParameters {
            text?: Parameters.Text;
            beforeId?: Parameters.BeforeId;
            appInstanceDepth?: Parameters.AppInstanceDepth;
            query?: Parameters.Query;
            types?: Parameters.Types;
            afterDate?: Parameters.AfterDate;
            beforeDate?: Parameters.BeforeDate;
            page?: Parameters.Page;
            limit?: Parameters.Limit;
            fields: Parameters.Fields;
        }
        namespace Responses {
            export interface $200 {
                result: {
                    [name: string]: {
                        value: any;
                        count: number;
                    }[];
                };
            }
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GetApp {
        namespace Parameters {
            export type AppSlug = string;
            export type Version = string;
        }
        export interface PathParameters {
            appSlug: Parameters.AppSlug;
        }
        export interface QueryParameters {
            version?: Parameters.Version;
        }
        namespace Responses {
            export type $200 = Prismeai.DSUL;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GetAppInstance {
        namespace Parameters {
            export type Slug = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            slug: Parameters.Slug;
        }
        namespace Responses {
            export type $200 = Prismeai.AppInstance;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GetAppInstanceConfig {
        namespace Parameters {
            export type Slug = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            slug: Parameters.Slug;
        }
        namespace Responses {
            export interface $200 {
            }
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GetAutomation {
        namespace Parameters {
            export type AutomationSlug = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            automationSlug: Parameters.AutomationSlug;
        }
        namespace Responses {
            export type $200 = /* Full description at (TODO swagger url) */ Prismeai.Automation;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GetFile {
        namespace Parameters {
            export type Id = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            id: Parameters.Id;
        }
        namespace Responses {
            export type $200 = Prismeai.File;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GetMyProfile {
        namespace Responses {
            export type $200 = Prismeai.User;
            export type $401 = Prismeai.AuthenticationError;
        }
    }
    namespace GetPage {
        namespace Parameters {
            export type Id = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            id: Parameters.Id;
        }
        namespace Responses {
            export type $200 = /* Page */ Prismeai.DetailedPage;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GetPageBySlug {
        namespace Parameters {
            export type Slug = string;
        }
        export interface PathParameters {
            slug: Parameters.Slug;
        }
        namespace Responses {
            export type $200 = /* Page */ Prismeai.DetailedPage;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GetPermissions {
        namespace Parameters {
            export type SubjectId = string;
            export type SubjectType = "workspaces" | "pages";
        }
        export interface PathParameters {
            subjectType: Parameters.SubjectType;
            subjectId: Parameters.SubjectId;
        }
        namespace Responses {
            export interface $200 {
                result: /**
                 * example:
                 * [
                 *   {
                 *     "email": "admin@prisme.ai",
                 *     "role": "admin"
                 *   },
                 *   {
                 *     "email": "readonly@prisme.ai",
                 *     "policies": {
                 *       "read": true
                 *     }
                 *   },
                 *   {
                 *     "public": true,
                 *     "policies": {
                 *       "read": true
                 *     }
                 *   }
                 * ]
                 */
                Prismeai.PermissionsList;
            }
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GetThisContact {
        namespace Parameters {
            export type ContactId = string;
        }
        export interface PathParameters {
            contactId: Parameters.ContactId;
        }
        namespace Responses {
            export type $200 = Prismeai.Contact;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GetWorkspace {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        namespace Responses {
            export type $200 = Prismeai.Workspace;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GetWorkspaces {
        namespace Parameters {
            export type Limit = number;
            export type Page = number;
        }
        export interface QueryParameters {
            page?: Parameters.Page;
            limit?: Parameters.Limit;
        }
        namespace Responses {
            export type $200 = {
                id?: string;
                name?: string;
            }[];
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
        }
    }
    namespace InstallAppInstance {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export type RequestBody = Prismeai.AppInstance;
        namespace Responses {
            export type $200 = Prismeai.AppInstance;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace ListApiKeys {
        namespace Parameters {
            export type SubjectId = string;
            export type SubjectType = "workspaces" | "pages";
        }
        export interface PathParameters {
            subjectType: Parameters.SubjectType;
            subjectId: Parameters.SubjectId;
        }
        namespace Responses {
            export type $200 = Prismeai.ApiKey[];
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace ListAppInstances {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        namespace Responses {
            export type $200 = Prismeai.AppInstanceDetailedList;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace ListFiles {
        namespace Parameters {
            export type Limit = number;
            export type Page = number;
            export interface Query {
                [name: string]: any;
            }
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export interface QueryParameters {
            page?: Parameters.Page;
            limit?: Parameters.Limit;
            query?: Parameters.Query;
        }
        namespace Responses {
            export type $200 = Prismeai.File[];
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace ListPages {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        namespace Responses {
            export type $200 = /* Page */ Prismeai.Page[];
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace Logout {
        namespace Responses {
            export interface $200 {
            }
        }
    }
    namespace PublishApp {
        export type RequestBody = Prismeai.App;
        namespace Responses {
            export type $200 = Prismeai.App;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
        }
    }
    namespace RevokePermissions {
        namespace Parameters {
            export type SubjectId = string;
            export type SubjectType = "workspaces" | "pages";
            export type UserId = string;
        }
        export interface PathParameters {
            subjectType: Parameters.SubjectType;
            subjectId: Parameters.SubjectId;
            userId: Parameters.UserId;
        }
        namespace Responses {
            export interface $200 {
                id: string;
            }
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace SearchApps {
        namespace Parameters {
            export type Limit = number;
            export type Page = number;
            export type Text = string;
            export type WorkspaceId = string;
        }
        export interface QueryParameters {
            text?: Parameters.Text;
            workspaceId?: Parameters.WorkspaceId;
            page?: Parameters.Page;
            limit?: Parameters.Limit;
        }
        namespace Responses {
            export type $200 = Prismeai.App[];
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
        }
    }
    namespace SendWorkspaceEvent {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export interface RequestBody {
            events: Prismeai.AllEventRequests;
        }
        namespace Responses {
            export type $200 = Prismeai.AllEventResponses;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace Share {
        namespace Parameters {
            export type SubjectId = string;
            export type SubjectType = "workspaces" | "pages";
        }
        export interface PathParameters {
            subjectType: Parameters.SubjectType;
            subjectId: Parameters.SubjectId;
        }
        export type RequestBody = Prismeai.UserPermissions;
        namespace Responses {
            export type $200 = Prismeai.UserPermissions;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace Signup {
        export interface RequestBody {
            email: string;
            password: string;
            firstName: string;
            lastName: string;
        }
        namespace Responses {
            export type $200 = Prismeai.User;
            export type $400 = Prismeai.BadParametersError;
        }
    }
    namespace UninstallAppInstance {
        namespace Parameters {
            export type Slug = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            slug: Parameters.Slug;
        }
        namespace Responses {
            export interface $200 {
                id: string;
            }
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace UpdateApiKey {
        namespace Parameters {
            export type ApiKey = string;
            export type SubjectId = string;
            export type SubjectType = "workspaces" | "pages";
        }
        export interface PathParameters {
            subjectType: Parameters.SubjectType;
            subjectId: Parameters.SubjectId;
            apiKey: Parameters.ApiKey;
        }
        export interface RequestBody {
            rules: Prismeai.ApiKeyRules;
        }
        namespace Responses {
            export type $200 = Prismeai.ApiKey;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace UpdateAppInstanceConfig {
        namespace Parameters {
            export type Slug = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            slug: Parameters.Slug;
        }
        export interface RequestBody {
        }
        namespace Responses {
            export type $200 = Prismeai.AppInstance;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace UpdateAutomation {
        namespace Parameters {
            export type AutomationSlug = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            automationSlug: Parameters.AutomationSlug;
        }
        export type RequestBody = /* Full description at (TODO swagger url) */ Prismeai.Automation;
        namespace Responses {
            export type $200 = /* Full description at (TODO swagger url) */ Prismeai.Automation;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace UpdatePage {
        namespace Parameters {
            export type Id = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            id: Parameters.Id;
        }
        export type RequestBody = /* Page */ Prismeai.Page;
        namespace Responses {
            export type $200 = /* Page */ Prismeai.Page;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace UpdateWorkspace {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export type RequestBody = Prismeai.Workspace;
        namespace Responses {
            export type $200 = Prismeai.Workspace;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace UploadFile {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export interface RequestBody {
            [name: string]: any;
            file: string; // binary
            /**
             * File expiration time in seconds
             */
            expiresAfter?: string;
        }
        namespace Responses {
            export type $200 = Prismeai.File[];
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
        }
    }
}
