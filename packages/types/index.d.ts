declare namespace Prismeai {
    export interface All {
        /**
         * Execute each instruction in parallel. Pause current automation execution until all instructions are processed.
         */
        all: Instruction[];
    }
    export type AllEventRequests = (GenericErrorEvent | FailedLogin | SucceededLogin | TriggeredAutomation | UpdatedContexts | CreatedWorkspace | UpdatedWorkspace | DeletedWorkspace | InstalledApp | ConfiguredApp | CreatedAutomation | UpdatedAutomation | DeletedAutomation | AppEvent)[];
    export type AllEventResponses = (PrismeEvent | {
        /**
         * example:
         * error
         */
        type: string;
        source: {
            app?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
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
            app?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
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
            app?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
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
         * runtime.automation.triggered
         */
        type: "runtime.automation.triggered";
        source: {
            app?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
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
            app?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
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
            app?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
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
            app?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
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
            app?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
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
         * workspaces.app.installed
         */
        type: "workspaces.app.installed";
        source: {
            app?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
        };
        payload: AppInstance;
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
         * workspaces.app.configured
         */
        type: "workspaces.app.configured";
        source: {
            app?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
        };
        payload: AppInstance;
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
         * workspaces.automation.created
         */
        type: "workspaces.automation.created";
        source: {
            app?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
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
         * workspaces.automation.updated
         */
        type: "workspaces.automation.updated";
        source: {
            app?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
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
         * workspaces.automation.deleted
         */
        type: "workspaces.automation.deleted";
        source: {
            app?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
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
        /**
         * example:
         * [
         *   "allowedEvent1",
         *   "allowedEvent2"
         * ]
         */
        events?: string[];
    }
    export interface App {
        name: string;
        description?: LocalizedText;
        photo?: string;
        owner?: {
            id?: string;
        };
        constants?: {
            [key: string]: any;
        };
        config?: {
            [name: string]: TypedArgument;
        };
        automations?: {
            [name: string]: /* Full description at (TODO swagger url) */ Automation;
        };
        /**
         * Unique id
         */
        id?: string;
    }
    export interface AppEvent {
        /**
         * Event name must be prefixed with apps.appName
         * example:
         * apps.someApp.someCustomEvent
         */
        type: string;
        payload: AnyValue;
    }
    export interface AppInstance {
        /**
         * App unique name
         * example:
         * prismeaiMessenger
         */
        app: string;
        name: string;
        /**
         * Inside the app, these config values will be accessible with $.Config.foo
         * example:
         * {
         *   "foo": "bar"
         * }
         */
        config?: {
            [key: string]: any;
        };
        /**
         * Unique id
         */
        id?: string;
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
         * $result
         */
        output?: any;
        /**
         * Set this to true if you don't want your automation to be accessible outside of your app. Default is false.
         * example:
         * false
         */
        private?: boolean;
        name: string;
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
    export interface Break {
        /**
         * Stop current automation execution. Does not have any configuration option
         */
        break: {
            [key: string]: any;
        };
    }
    export interface Conditions {
        [name: string]: InstructionList;
        default: InstructionList;
    }
    export interface ConfiguredApp {
        /**
         * example:
         * workspaces.app.configured
         */
        type: "workspaces.app.configured";
        payload: AppInstance;
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
            subjectType: "workspaces";
            subjectId: string;
            rules: ApiKeyRules;
        };
    }
    export interface CreatedAutomation {
        /**
         * example:
         * workspaces.automation.created
         */
        type: "workspaces.automation.created";
        payload: {
            slug: string;
            automation: /* Full description at (TODO swagger url) */ Automation;
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
            subjectType: "workspaces";
            subjectId: string;
        };
    }
    export interface DeletedAutomation {
        /**
         * example:
         * workspaces.automation.deleted
         */
        type: "workspaces.automation.deleted";
        payload: {
            automation: {
                slug: string;
                name: string;
            };
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
    export interface Emit {
        emit: {
            /**
             * example:
             * prismeaiMessenger.message
             */
            event: string;
            payload?: {
                [key: string]: any;
            };
            /**
             * example:
             * If true, can't be listened from any other app than current one
             */
            private?: boolean;
        };
    }
    export interface ExecutedAutomation {
        /**
         * example:
         * runtime.automation.executed
         */
        type: "runtime.automation.executed";
        payload: {
            slug: string;
            payload: {
                [key: string]: any;
            };
            output: AnyValue;
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
                [name: string]: any;
            };
            /**
             * HTTP request body
             */
            body?: {
                [key: string]: any;
            };
            /**
             * Name of the variable which will hold the result
             */
            output?: string;
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
    export interface InstalledApp {
        /**
         * example:
         * workspaces.app.installed
         */
        type: "workspaces.app.installed";
        payload: AppInstance;
    }
    export type Instruction = Emit | Wait | Set | Delete | Conditions | Repeat | All | Break | Fetch | {
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
     *   }
     * ]
     */
    export type PermissionsList = UserPermissions[];
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
            app?: string;
            userId?: string;
            workspaceId?: string;
            host: {
                service: string;
            };
            correlationId: string;
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
    export interface Repeat {
        /**
         * One of "on" or "until" is required
         */
        repeat: /* One of "on" or "until" is required */ {
            on: string;
            until?: number;
            then: InstructionList;
        } | {
            on?: string;
            until: number;
            then: InstructionList;
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
            lifespan?: /* Rules defining when a variable should be automatically removed */ VariableLifespan;
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
    export interface TriggeredAutomation {
        /**
         * example:
         * runtime.automation.triggered
         */
        type: "runtime.automation.triggered";
        payload: {
            event: {
                id?: string;
                type?: string;
            };
            slug: string;
            payload?: {
                [key: string]: any;
            };
        };
    }
    export interface TriggeredWebhook {
        /**
         * example:
         * runtime.webhook.triggered
         */
        type: "runtime.webhook.triggered";
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
        type?: "string" | "number";
        description?: LocalizedText;
    }
    export interface UpdatedApiKey {
        /**
         * example:
         * apikeys.updated
         */
        type: "apikeys.updated";
        payload: {
            apiKey: string;
            subjectType: "workspaces";
            subjectId: string;
            rules: ApiKeyRules;
        };
    }
    export interface UpdatedAutomation {
        /**
         * example:
         * workspaces.automation.updated
         */
        type: "workspaces.automation.updated";
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
    export interface UserPermissions {
        email: string;
        id?: string;
        role?: Role;
        policies?: Policies;
    }
    /**
     * Rules defining when a variable should be automatically removed
     */
    export interface VariableLifespan {
        /**
         * Number of user messages sent before automatically removing this variable
         */
        messages?: number;
        /**
         * Number of seconds elapsed since this variable initialization, before automatically removing it
         */
        seconds?: number;
    }
    export interface Wait {
        wait: {
            /**
             * example:
             * prismeaiMessenger.message
             */
            event: string;
            /**
             * Only match the next intent fulfilling these filters. Multiple filters will be joined with an 'AND' operator
             * example:
             * {
             *   "automationSlug": "someId",
             *   "someObjectField.someNestedField": "foo"
             * }
             */
            filters?: {
                [key: string]: any;
            };
            /**
             * Will save the caught event inside this variable
             * example:
             * nameOfResultVariable
             */
            output?: string;
        };
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
    export interface Workspace {
        name: string;
        owner?: {
            id?: string;
        };
        imports?: AppInstance[];
        constants?: {
            [key: string]: any;
        };
        automations?: {
            [name: string]: /* Full description at (TODO swagger url) */ Automation;
        };
        createdAt?: string;
        updatedAt?: string;
        id?: string;
    }
}
declare namespace PrismeaiAPI {
    namespace AnonymousAuth {
        namespace Responses {
            export type $200 = Prismeai.User;
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
    namespace ConfigureApp {
        namespace Parameters {
            export type InstalledAppId = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            installedAppId: Parameters.InstalledAppId;
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
    namespace CreateApiKey {
        namespace Parameters {
            export type SubjectId = string;
            export type SubjectType = "workspaces";
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
    namespace CreateApp {
        export type RequestBody = Prismeai.App;
        namespace Responses {
            export type $200 = Prismeai.App;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
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
            export type $200 = Prismeai.User;
            export type $401 = Prismeai.AuthenticationError;
        }
    }
    namespace DeleteApiKey {
        namespace Parameters {
            export type ApiKey = string;
            export type SubjectId = string;
            export type SubjectType = "workspaces";
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
            export type AppId = string;
        }
        export interface PathParameters {
            appId: Parameters.AppId;
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
            export type BeforeDate = string;
            export type BeforeId = string;
            export type CorrelationId = string;
            export type Limit = number;
            export type Page = number;
            export interface Query {
                [name: string]: any;
            }
            export type Types = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export interface QueryParameters {
            correlationId?: Parameters.CorrelationId;
            beforeId?: Parameters.BeforeId;
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
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GetApp {
        namespace Parameters {
            export type AppId = string;
        }
        export interface PathParameters {
            appId: Parameters.AppId;
        }
        namespace Responses {
            export type $200 = Prismeai.App;
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
    namespace GetInstalledApp {
        namespace Parameters {
            export type InstalledAppId = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            installedAppId: Parameters.InstalledAppId;
        }
        namespace Responses {
            export type $200 = Prismeai.AppInstance;
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
    namespace GetPermissions {
        namespace Parameters {
            export type SubjectId = string;
            export type SubjectType = "workspaces";
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
    namespace InstallApp {
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
            export type SubjectType = "workspaces";
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
    namespace Logout {
        namespace Responses {
            export interface $200 {
            }
        }
    }
    namespace RevokePermissions {
        namespace Parameters {
            export type SubjectId = string;
            export type SubjectType = "workspaces";
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
            export type Limit = string;
            export type Page = string;
            export type Query = string;
        }
        export interface QueryParameters {
            query?: Parameters.Query;
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
            export type SubjectType = "workspaces";
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
    namespace UninstallApp {
        namespace Parameters {
            export type InstalledAppId = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            installedAppId: Parameters.InstalledAppId;
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
            export type SubjectType = "workspaces";
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
    namespace UpdateApp {
        namespace Parameters {
            export type AppId = string;
        }
        export interface PathParameters {
            appId: Parameters.AppId;
        }
        export type RequestBody = Prismeai.App;
        namespace Responses {
            export type $200 = Prismeai.App;
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
}
