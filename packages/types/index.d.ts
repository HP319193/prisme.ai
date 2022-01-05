declare namespace Prismeai {
    export interface All {
        /**
         * Execute each instruction in parallel. Pause current workflow execution until all instructions are processed.
         */
        all: Instruction[];
    }
    export type AllEventRequests = (GenericErrorEvent | FailedLogin | SucceededLogin | TriggeredWorkflow | UpdatedContexts | CreatedWorkspace | UpdatedWorkspace | DeletedWorkspace | InstalledApp | ConfiguredApp | CreatedAutomation | UpdatedAutomation | DeletedAutomation)[];
    export type AllEventResponses = ({
        /**
         * Creation date (ISO8601)
         */
        createdAt?: string;
        source?: {
            app?: string;
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
            /**
             * Related workspace
             */
            workspace?: {
                id?: string;
            };
            host?: {
                ip?: string;
            };
            correlationId?: string;
        };
        target?: {
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
        };
        error?: {
            code?: string;
            message?: string;
            details?: {
                [key: string]: any;
            }[];
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        id?: string;
        /**
         * example:
         * error
         */
        type?: string;
    } | {
        /**
         * Creation date (ISO8601)
         */
        createdAt?: string;
        source?: {
            app?: string;
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
            /**
             * Related workspace
             */
            workspace?: {
                id?: string;
            };
            host?: {
                ip?: string;
            };
            correlationId?: string;
        };
        target?: {
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
        };
        error?: {
            code?: string;
            message?: string;
            details?: {
                [key: string]: any;
            }[];
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        id?: string;
        /**
         * example:
         * gateway.login.failed
         */
        type: "gateway.login.failed";
        payload: {
            ip: string;
            email: string;
        };
    } | {
        /**
         * Creation date (ISO8601)
         */
        createdAt?: string;
        source?: {
            app?: string;
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
            /**
             * Related workspace
             */
            workspace?: {
                id?: string;
            };
            host?: {
                ip?: string;
            };
            correlationId?: string;
        };
        target?: {
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
        };
        error?: {
            code?: string;
            message?: string;
            details?: {
                [key: string]: any;
            }[];
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        id?: string;
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
    } | {
        /**
         * Creation date (ISO8601)
         */
        createdAt?: string;
        source?: {
            app?: string;
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
            /**
             * Related workspace
             */
            workspace?: {
                id?: string;
            };
            host?: {
                ip?: string;
            };
            correlationId?: string;
        };
        target?: {
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
        };
        error?: {
            code?: string;
            message?: string;
            details?: {
                [key: string]: any;
            }[];
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        id?: string;
        /**
         * example:
         * runtime.workflow.triggered
         */
        type: "runtime.workflow.triggered";
        payload: {
            event: {
                id?: string;
                type?: string;
            };
            workflow: string;
            payload?: {
                [key: string]: any;
            };
        };
    } | {
        /**
         * Creation date (ISO8601)
         */
        createdAt?: string;
        source?: {
            app?: string;
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
            /**
             * Related workspace
             */
            workspace?: {
                id?: string;
            };
            host?: {
                ip?: string;
            };
            correlationId?: string;
        };
        target?: {
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
        };
        error?: {
            code?: string;
            message?: string;
            details?: {
                [key: string]: any;
            }[];
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        id?: string;
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
    } | {
        /**
         * Creation date (ISO8601)
         */
        createdAt?: string;
        source?: {
            app?: string;
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
            /**
             * Related workspace
             */
            workspace?: {
                id?: string;
            };
            host?: {
                ip?: string;
            };
            correlationId?: string;
        };
        target?: {
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
        };
        error?: {
            code?: string;
            message?: string;
            details?: {
                [key: string]: any;
            }[];
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        id?: string;
        /**
         * example:
         * workspaces.created
         */
        type: "workspaces.created";
        payload: {
            workspace: Workspace;
        };
    } | {
        /**
         * Creation date (ISO8601)
         */
        createdAt?: string;
        source?: {
            app?: string;
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
            /**
             * Related workspace
             */
            workspace?: {
                id?: string;
            };
            host?: {
                ip?: string;
            };
            correlationId?: string;
        };
        target?: {
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
        };
        error?: {
            code?: string;
            message?: string;
            details?: {
                [key: string]: any;
            }[];
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        id?: string;
        /**
         * example:
         * workspaces.updated
         */
        type: "workspaces.updated";
        payload: {
            workspace: Workspace;
        };
    } | {
        /**
         * Creation date (ISO8601)
         */
        createdAt?: string;
        source?: {
            app?: string;
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
            /**
             * Related workspace
             */
            workspace?: {
                id?: string;
            };
            host?: {
                ip?: string;
            };
            correlationId?: string;
        };
        target?: {
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
        };
        error?: {
            code?: string;
            message?: string;
            details?: {
                [key: string]: any;
            }[];
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        id?: string;
        /**
         * example:
         * workspaces.deleted
         */
        type: "workspaces.deleted";
        payload: {
            workspaceId: string;
        };
    } | {
        /**
         * Creation date (ISO8601)
         */
        createdAt?: string;
        source?: {
            app?: string;
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
            /**
             * Related workspace
             */
            workspace?: {
                id?: string;
            };
            host?: {
                ip?: string;
            };
            correlationId?: string;
        };
        target?: {
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
        };
        error?: {
            code?: string;
            message?: string;
            details?: {
                [key: string]: any;
            }[];
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        id?: string;
        /**
         * example:
         * workspaces.app.installed
         */
        type: "workspaces.app.installed";
        payload: AppInstance;
    } | {
        /**
         * Creation date (ISO8601)
         */
        createdAt?: string;
        source?: {
            app?: string;
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
            /**
             * Related workspace
             */
            workspace?: {
                id?: string;
            };
            host?: {
                ip?: string;
            };
            correlationId?: string;
        };
        target?: {
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
        };
        error?: {
            code?: string;
            message?: string;
            details?: {
                [key: string]: any;
            }[];
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        id?: string;
        /**
         * example:
         * workspaces.app.configured
         */
        type: "workspaces.app.configured";
        payload: AppInstance;
    } | {
        /**
         * Creation date (ISO8601)
         */
        createdAt?: string;
        source?: {
            app?: string;
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
            /**
             * Related workspace
             */
            workspace?: {
                id?: string;
            };
            host?: {
                ip?: string;
            };
            correlationId?: string;
        };
        target?: {
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
        };
        error?: {
            code?: string;
            message?: string;
            details?: {
                [key: string]: any;
            }[];
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        id?: string;
        /**
         * example:
         * workspaces.automation.created
         */
        type: "workspaces.automation.created";
        payload: {
            automation: /* Full description at (TODO swagger url) */ Automation;
        };
    } | {
        /**
         * Creation date (ISO8601)
         */
        createdAt?: string;
        source?: {
            app?: string;
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
            /**
             * Related workspace
             */
            workspace?: {
                id?: string;
            };
            host?: {
                ip?: string;
            };
            correlationId?: string;
        };
        target?: {
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
        };
        error?: {
            code?: string;
            message?: string;
            details?: {
                [key: string]: any;
            }[];
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        id?: string;
        /**
         * example:
         * workspaces.automation.updated
         */
        type: "workspaces.automation.updated";
        payload: {
            automation: /* Full description at (TODO swagger url) */ Automation;
        };
    } | {
        /**
         * Creation date (ISO8601)
         */
        createdAt?: string;
        source?: {
            app?: string;
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
            /**
             * Related workspace
             */
            workspace?: {
                id?: string;
            };
            host?: {
                ip?: string;
            };
            correlationId?: string;
        };
        target?: {
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
        };
        error?: {
            code?: string;
            message?: string;
            details?: {
                [key: string]: any;
            }[];
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        id?: string;
        /**
         * example:
         * workspaces.automation.deleted
         */
        type: "workspaces.automation.deleted";
        payload: {
            automation: {
                id: string;
                name: string;
            };
        };
    })[];
    export type AnyValue = any;
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
        automations?: /* Full description at (TODO swagger url) */ Automation[];
        /**
         * Unique id
         */
        id?: string;
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
        triggers?: {
            [name: string]: Trigger;
        };
        workflows: {
            [name: string]: Workflow;
        };
        id?: string;
        name?: string;
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
    export interface BaseEventResponse {
        /**
         * Creation date (ISO8601)
         */
        createdAt?: string;
        source?: {
            app?: string;
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
            /**
             * Related workspace
             */
            workspace?: {
                id?: string;
            };
            host?: {
                ip?: string;
            };
            correlationId?: string;
        };
        target?: {
            /**
             * Authenticated user
             */
            user?: {
                id?: string;
            };
        };
        error?: {
            code?: string;
            message?: string;
            details?: {
                [key: string]: any;
            }[];
            /**
             * example:
             * warning
             */
            level?: "warning" | "error" | "fatal";
        };
        id?: string;
    }
    export interface Break {
        /**
         * Stop current workflow execution. Does not have any configuration option
         */
        break: {
            [key: string]: any;
        };
    }
    export type Conditions = If | ElseIf | Else;
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
    export interface CreatedAutomation {
        /**
         * example:
         * workspaces.automation.created
         */
        type: "workspaces.automation.created";
        payload: {
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
    export interface DeletedAutomation {
        /**
         * example:
         * workspaces.automation.deleted
         */
        type: "workspaces.automation.deleted";
        payload: {
            automation: {
                id: string;
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
    export interface Else {
        else: {
            then: InstructionList;
        };
    }
    export interface ElseIf {
        elseif: {
            condition: string;
            then: InstructionList;
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
    export interface ExecutedWorkflow {
        /**
         * example:
         * runtime.workflow.executed
         */
        type: "runtime.workflow.executed";
        payload: {
            workflow: string;
            automation: string;
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
        type?: string;
    }
    export interface If {
        if: {
            condition: string;
            then: InstructionList;
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
    export type Instruction = Emit | Wait | Set | Delete | Conditions | Repeat | All | Break | {
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
    export type Trigger = {
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
        /**
         * Target workflow
         * example:
         * MyWorkflow
         */
        do: string;
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
        /**
         * Target workflow
         * example:
         * MyWorkflow
         */
        do: string;
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
        /**
         * Target workflow
         * example:
         * MyWorkflow
         */
        do: string;
    };
    export interface TriggeredWebhook {
        /**
         * example:
         * runtime.webhook.triggered
         */
        type: "runtime.webhook.triggered";
        payload: {
            workspaceId: string;
            automationId: string;
            originalUrl: string;
            /**
             * example:
             * post
             */
            method: string;
            headers: {
                [key: string]: any;
            };
            payload: {
                [key: string]: any;
            };
        };
    }
    export interface TriggeredWorkflow {
        /**
         * example:
         * runtime.workflow.triggered
         */
        type: "runtime.workflow.triggered";
        payload: {
            event: {
                id?: string;
                type?: string;
            };
            workflow: string;
            payload?: {
                [key: string]: any;
            };
        };
    }
    export interface TypedArgument {
        type?: "string" | "number";
        description?: LocalizedText;
    }
    export interface UpdatedAutomation {
        /**
         * example:
         * workspaces.automation.updated
         */
        type: "workspaces.automation.updated";
        payload: {
            automation: /* Full description at (TODO swagger url) */ Automation;
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
             *   "automationId": "someId",
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
    export interface Workflow {
        description?: LocalizedText;
        arguments?: {
            [name: string]: TypedArgument;
        };
        do: InstructionList;
        /**
         * Workflow result expression. Might be a variable reference, an object/array with variables inside ...
         * example:
         * $result
         */
        output?: any;
        /**
         * Set this to true if you don't want your workflow to be accessible outside of your app. Default is false.
         * example:
         * false
         */
        private?: boolean;
    }
    export interface WorkflowResult {
        workflow: string;
        output?: AnyValue;
    }
    export interface Workspace {
        name: string;
        owner?: {
            id?: string;
        };
        imports?: AppInstance[];
        constants?: {
            [key: string]: any;
        };
        automations?: /* Full description at (TODO swagger url) */ Automation[];
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
            export type AutomationId = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            automationId: Parameters.AutomationId;
        }
        /**
         * Entire body will be passed as a payload to the triggered workflow
         */
        export interface RequestBody {
        }
        namespace Responses {
            export interface $200 {
                result: Prismeai.WorkflowResult[];
            }
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
            export type AutomationId = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            automationId: Parameters.AutomationId;
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
            export type Filter = string;
            export type FromDate = string;
            export type Limit = number;
            export type Longpolling = number;
            export type Page = number;
            export type SomePayloadFieldSubField = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export interface QueryParameters {
            "somePayloadField.subField"?: Parameters.SomePayloadFieldSubField;
            filter?: Parameters.Filter;
            fromDate?: Parameters.FromDate;
            longpolling?: Parameters.Longpolling;
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
            export type AutomationId = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            automationId: Parameters.AutomationId;
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
    namespace Logout {
        namespace Responses {
            export interface $200 {
            }
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
    namespace SendConversationEvent {
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
            export type AutomationId = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            automationId: Parameters.AutomationId;
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
