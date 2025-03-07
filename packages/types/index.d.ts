declare namespace Prismeai {
    export interface AccessToken {
        expiresAt: string;
        name: string;
        token?: string;
        userId?: string;
        id?: string;
    }
    export type ActionTypes = "manage" | "create" | "read" | "update" | "delete" | "manage_permissions" | "manage_security" | "manage_repositories" | "read_app_dsul" | "get_usage" | "aggregate_search" | "execute" | "test";
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload?: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
        /**
         * App unique id
         */
        appSlug: string;
        appName?: LocalizedText;
        /**
         * Defaults to the latest known app version
         */
        appVersion?: string;
        /**
         * Unique & human readable id across current workspace's appInstances, which will be used to call this app automations
         */
        slug?: string;
        /**
         * If disabled, this appInstance will be ignored during execution
         */
        disabled?: boolean;
        labels?: string /* ^[0-9A-Za-z._:-]{2,60}$ */[];
        updatedAt?: string;
        updatedBy?: string;
        createdBy?: string;
        config?: any;
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
    })[];
    export type AnyValue = any;
    export interface ApiKey {
        name?: string;
        apiKey: string;
        subjectType: string;
        subjectId: string;
        rules: PermissionRule[];
        disabled?: boolean;
    }
    export interface App {
        workspaceId: string;
        versions?: string[] | WorkspaceVersion[];
        name?: string;
        description?: LocalizedText;
        documentation?: {
            workspaceSlug: string;
            slug: string;
        };
        config?: Config;
        photo?: string;
        labels?: string /* ^[0-9A-Za-z._:-]{2,60}$ */[];
        slug: string;
        updatedAt?: string;
        createdAt?: string;
        updatedBy?: string;
        createdBy?: string;
    }
    export type AppAutomations = {
        slug: string;
        name: LocalizedText;
        description?: LocalizedText;
        arguments: {
            [name: string]: TypedArgument;
        };
    }[];
    export type AppBlocks = {
        slug: string;
        url?: string;
        edit?: TypedArgument;
        name?: LocalizedText;
        description?: LocalizedText;
        arguments?: {
            [name: string]: TypedArgument;
        };
    }[];
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
        appName?: LocalizedText;
        /**
         * Defaults to the latest known app version
         */
        appVersion?: string;
        /**
         * Unique & human readable id across current workspace's appInstances, which will be used to call this app automations
         */
        slug?: string;
        /**
         * If disabled, this appInstance will be ignored during execution
         */
        disabled?: boolean;
        labels?: string /* ^[0-9A-Za-z._:-]{2,60}$ */[];
        updatedAt?: string;
        createdAt?: string;
        updatedBy?: string;
        createdBy?: string;
        config?: any;
    }
    export interface AppInstanceMeta {
        /**
         * App unique id
         */
        appSlug: string;
        appName?: LocalizedText;
        /**
         * Defaults to the latest known app version
         */
        appVersion?: string;
        /**
         * Unique & human readable id across current workspace's appInstances, which will be used to call this app automations
         */
        slug?: string;
        /**
         * If disabled, this appInstance will be ignored during execution
         */
        disabled?: boolean;
        labels?: string /* ^[0-9A-Za-z._:-]{2,60}$ */[];
        updatedAt?: string;
        createdAt?: string;
        updatedBy?: string;
        createdBy?: string;
    }
    export interface AppUsageEvent {
        /**
         * example:
         * usage
         */
        type: "usage";
        payload: {
            metrics: {
                [name: string]: {
                    value: number;
                    action: "set" | "increment";
                };
            };
        };
    }
    export interface AppUsageMetrics {
        slug: string;
        total: {
            custom: {
                [name: string]: any;
            };
        };
        appInstances?: {
            slug: string;
            total: {
                custom: {
                    [name: string]: any;
                };
            };
        }[];
    }
    export interface AuthData {
        [name: string]: any;
        id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        language?: any;
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
    export interface Automation {
        description?: LocalizedText;
        /**
         * Set this to true if you don't want your automation to be accessible outside of your app. Default is false.
         * example:
         * false
         */
        private?: boolean;
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
        arguments?: {
            [name: string]: TypedArgument;
        };
        validateArguments?: boolean;
        when?: When;
        labels?: string /* ^[0-9A-Za-z._:-]{2,60}$ */[];
        events?: ProcessedEvents;
        updatedAt?: string;
        createdAt?: string;
        updatedBy?: string;
        createdBy?: string;
        do: InstructionList;
        /**
         * Automation result expression. Might be a variable reference, an object/array with variables inside ...
         * example:
         * {{result}}
         */
        output?: any;
        authorizations?: {
            action?: string;
        };
    }
    export interface AutomationMeta {
        description?: LocalizedText;
        /**
         * Set this to true if you don't want your automation to be accessible outside of your app. Default is false.
         * example:
         * false
         */
        private?: boolean;
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
        arguments?: {
            [name: string]: TypedArgument;
        };
        validateArguments?: boolean;
        when?: When;
        labels?: string /* ^[0-9A-Za-z._:-]{2,60}$ */[];
        events?: ProcessedEvents;
        updatedAt?: string;
        createdAt?: string;
        updatedBy?: string;
        createdBy?: string;
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
        details?: any;
    }
    /**
     * Block
     */
    export interface Block {
        description?: LocalizedText;
        name?: LocalizedText;
        photo?: string;
        /**
         * A block can be a javascript bundled file. Host it on the internet and put its url here.
         */
        url?: string;
        edit?: TypedArgument;
        /**
         * A block can extends another one by giving its name here
         */
        block?: string;
        /**
         * default config applied to the Block. Usefull for extended Blocks.
         */
        config?: AnyValue;
        automation?: string | {
            slug?: string;
            payload?: AnyValue;
        };
        blocks?: {
            [name: string]: any;
            slug: string;
            appInstance?: string;
            onInit?: string | {
                event?: string;
                payload?: AnyValue;
            };
            updateOn?: string;
            automation?: string | {
                slug?: string;
                payload?: AnyValue;
            };
        }[];
        /**
         * Css applied to Block
         */
        css?: string;
        schema?: TypedArgument;
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
    export interface CleanedEvents {
        /**
         * example:
         * events.cleaned
         */
        type: "events.cleaned";
        payload: {
            indicesWithoutDatastream?: any;
            inactiveDatastreams?: any;
            emptyIndices?: any;
            expiredEvents?: any;
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
            appInstance: {
                /**
                 * App unique id
                 */
                appSlug: string;
                appName?: LocalizedText;
                /**
                 * Defaults to the latest known app version
                 */
                appVersion?: string;
                /**
                 * Unique & human readable id across current workspace's appInstances, which will be used to call this app automations
                 */
                slug?: string;
                /**
                 * If disabled, this appInstance will be ignored during execution
                 */
                disabled?: boolean;
                labels?: string /* ^[0-9A-Za-z._:-]{2,60}$ */[];
                updatedAt?: string;
                createdAt?: string;
                updatedBy?: string;
                createdBy?: string;
                config?: any;
                oldConfig?: any;
            };
            slug: string;
            /**
             * Filled with the previous appInstance slug when renamed
             */
            oldSlug?: string;
            events?: ProcessedEvents;
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
            oldConfig?: any;
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
        language?: string;
        /**
         * Profile picture URL
         */
        photo?: string;
        status?: "pending" | "validated" | "deactivated";
        meta?: {
            [key: string]: any;
        };
        groups?: string[];
        /**
         * Unique id
         */
        id?: string;
    }
    export type ContextSetType = "replace" | "merge" | "push" | "delete";
    export interface CreateUserTopic {
        createUserTopic: UserTopic;
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
            rules: PermissionRule[];
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
            automation: Automation;
            events?: ProcessedEvents;
        };
    }
    export interface CreatedPage {
        /**
         * example:
         * workspaces.pages.created
         */
        type: "workspaces.pages.created";
        payload: {
            page: Page;
            events?: ProcessedEvents;
        };
    }
    export interface CreatedUserTopic {
        /**
         * example:
         * events.userTopics.created
         */
        type: "events.userTopics.created";
        payload: UserTopic;
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
        name: string; // ^[0-9A-Za-zéèê ,.'-]{2,60}$
        description?: LocalizedText;
        photo?: string;
        config?: Config;
        blocks?: {
            [name: string]: /* Block */ Block;
        };
        slug?: string;
        id?: string;
        labels?: string /* ^[0-9A-Za-z._:-]{2,60}$ */[];
        customDomains?: string[];
        /**
         * If true, make this workspace metadata available to all workspaces with this variable : {{global.workspacesRegistry[WORKSPACE_SLUG]}}
         */
        registerWorkspace?: boolean;
        /**
         * Remote versioning repositories
         */
        repositories?: {
            [name: string]: WorkspaceRepository;
        };
        secrets?: {
            schema?: {
                [name: string]: TypedArgument;
            };
        };
    }
    export interface DSULPatch {
        name?: string; // ^[0-9A-Za-zéèê ,.'-]{2,60}$
        description?: LocalizedText;
        photo?: string;
        config?: Config;
        blocks?: {
            [name: string]: /* Block */ Block;
        };
        slug?: string;
        id?: string;
        labels?: string /* ^[0-9A-Za-z._:-]{2,60}$ */[];
        customDomains?: string[];
        /**
         * If true, make this workspace metadata available to all workspaces with this variable : {{global.workspacesRegistry[WORKSPACE_SLUG]}}
         */
        registerWorkspace?: boolean;
        /**
         * Remote versioning repositories
         */
        repositories?: {
            [name: string]: WorkspaceRepository;
        };
        secrets?: {
            schema?: {
                [name: string]: TypedArgument;
            };
        };
    }
    export interface DSULReadOnly {
        name: string; // ^[0-9A-Za-zéèê ,.'-]{2,60}$
        description?: LocalizedText;
        photo?: string;
        config?: Config;
        blocks?: {
            [name: string]: /* Block */ Block;
        };
        slug?: string;
        id?: string;
        labels?: string /* ^[0-9A-Za-z._:-]{2,60}$ */[];
        customDomains?: string[];
        /**
         * If true, make this workspace metadata available to all workspaces with this variable : {{global.workspacesRegistry[WORKSPACE_SLUG]}}
         */
        registerWorkspace?: boolean;
        /**
         * Remote versioning repositories
         */
        repositories?: {
            [name: string]: WorkspaceRepository;
        };
        secrets?: {
            schema?: {
                [name: string]: TypedArgument;
            };
        };
        automations?: {
            [name: string]: AutomationMeta;
        };
        pages?: {
            [name: string]: /* Page */ PageMeta;
        };
        imports?: {
            [name: string]: DetailedAppInstance;
        };
        createdAt?: string;
        updatedAt?: string;
        createdBy?: string;
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
            automationSlug: string;
        };
    }
    export interface DeletedPage {
        /**
         * example:
         * workspaces.pages.deleted
         */
        type: "workspaces.pages.deleted";
        payload: {
            pageSlug: string;
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
            workspaceSlug?: string;
        };
    }
    export interface DeletedWorkspaceVersion {
        /**
         * example:
         * workspaces.versions.deleted
         */
        type: "workspaces.versions.deleted";
        payload: {
            version: WorkspaceVersion;
        };
    }
    export interface DetailedAppInstance {
        /**
         * App unique id
         */
        appSlug: string;
        appName?: LocalizedText;
        /**
         * Defaults to the latest known app version
         */
        appVersion?: string;
        /**
         * Unique & human readable id across current workspace's appInstances, which will be used to call this app automations
         */
        slug: string;
        /**
         * If disabled, this appInstance will be ignored during execution
         */
        disabled?: boolean;
        labels?: string /* ^[0-9A-Za-z._:-]{2,60}$ */[];
        updatedAt?: string;
        createdAt?: string;
        updatedBy?: string;
        createdBy?: string;
        photo?: string;
        automations: AppAutomations;
        events: ProcessedEvents;
        blocks: AppBlocks;
    }
    export interface DetailedPage {
        name?: LocalizedText;
        description?: LocalizedText;
        workspaceId?: string;
        workspaceSlug?: string;
        id?: string;
        slug: string;
        blocks?: {
            [name: string]: any;
            slug: string;
            appInstance?: string;
            onInit?: string | {
                event?: string;
                payload?: AnyValue;
            };
            updateOn?: string;
            automation?: string | {
                slug?: string;
                payload?: AnyValue;
            };
        }[];
        labels?: string /* ^[0-9A-Za-z._:-]{2,60}$ */[];
        events?: ProcessedEvents;
        createdBy?: string;
        updatedBy?: string;
        createdAt?: string;
        updatedAt?: string;
        permissions?: PermissionsMap;
        customDomains?: string[];
        styles?: string;
        onInit?: string | {
            event?: string;
            payload?: AnyValue;
        };
        updateOn?: string;
        notifyOn?: string;
        automation?: string | {
            slug?: string;
            payload?: AnyValue;
        };
        appInstances: {
            slug?: string;
            blocks?: {
                [name: string]: /* Block */ Block;
            } | {
                [name: string]: string;
            };
        }[];
        /**
         * Indicates whether this page is public. Reflects page permissions and cannot be set directly
         */
        public?: boolean;
        apiKey?: string;
        clientId?: string;
        favicon?: string;
    }
    export interface DuplicatedWorkspace {
        /**
         * example:
         * workspaces.duplicated
         */
        type: "workspaces.duplicated";
        payload: {
            workspace: Workspace;
            fromWorkspace?: {
                name: string;
                slug?: string;
                id: string;
            };
        };
    }
    export interface Emit {
        emit: {
            /**
             * example:
             * prismeaiMessenger.message
             */
            event: string;
            payload?: AnyValue;
            target?: PrismeEventTarget;
            private?: boolean;
            autocomplete?: EmitAutocomplete;
            options?: PrismeEventOptions;
        };
    }
    export interface EmitAutocomplete {
        [name: string]: {
            from?: string;
            path?: string;
            template?: string;
        };
    }
    export interface EventsWebsocketsMessage {
        /**
         * example:
         * events.websockets.message
         */
        type: "events.websockets.message";
        payload: {
            [name: string]: any;
            rooms: string[];
            event: any;
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
            trigger: {
                type?: string;
                value?: string;
            };
            payload: {
                [key: string]: any;
            };
            output: AnyValue;
            duration: number;
            throttled?: number;
            startedAt: string;
            break: boolean;
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
                 * Only for requests towards prisme.ai API. Grants additional permissions using api keys
                 */
                prismeaiApiKey?: {
                    /**
                     * Use one of the DSUL Security defined api keys, referred by its name.
                     */
                    name?: string;
                };
                /**
                 * Object defining querystring parameters
                 */
                query?: {
                    [name: string]: string;
                };
                /**
                 * HTTP request body
                 */
                body?: AnyValue;
                /**
                 * If HTTP response status code is 4xx or 5xx, emits a runtime.fetch.failed event by default
                 */
                emitErrors?: boolean;
                /**
                 * Sends a multipart/form-data HTTP request
                 */
                multipart?: {
                    fieldname: string;
                    /**
                     * Must be a string. Raw files must be given as base64
                     */
                    value: string;
                    /**
                     * Filename is required when value is a base64 encoded file
                     */
                    filename?: string;
                    /**
                     * Optional MIME content-type
                     */
                    contentType?: string;
                }[];
                /**
                 * Name of the variable which will hold the result
                 */
                output?: string;
                /**
                 * By default, SSE chunks are written to the output variable which can be read in real time using repeat instruction. Change this behaviour to emit chunks as individual events instead.
                 */
                stream?: {
                    event: string;
                    concatenate?: {
                        path?: string;
                        throttle?: number;
                    };
                    payload?: {
                        [name: string]: any;
                    };
                    target?: PrismeEventTarget;
                    options?: PrismeEventOptions;
                };
                outputMode?: "body" | "detailed_response" | "data_url";
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
            ip?: string;
            email?: string;
            provider?: string;
        };
    }
    export interface FailedMFA {
        /**
         * example:
         * gateway.mfa.failed
         */
        type: "gateway.mfa.failed";
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
             * Only for requests towards prisme.ai API. Grants additional permissions using api keys
             */
            prismeaiApiKey?: {
                /**
                 * Use one of the DSUL Security defined api keys, referred by its name.
                 */
                name?: string;
            };
            /**
             * Object defining querystring parameters
             */
            query?: {
                [name: string]: string;
            };
            /**
             * HTTP request body
             */
            body?: AnyValue;
            /**
             * If HTTP response status code is 4xx or 5xx, emits a runtime.fetch.failed event by default
             */
            emitErrors?: boolean;
            /**
             * Sends a multipart/form-data HTTP request
             */
            multipart?: {
                fieldname: string;
                /**
                 * Must be a string. Raw files must be given as base64
                 */
                value: string;
                /**
                 * Filename is required when value is a base64 encoded file
                 */
                filename?: string;
                /**
                 * Optional MIME content-type
                 */
                contentType?: string;
            }[];
            /**
             * Name of the variable which will hold the result
             */
            output?: string;
            /**
             * By default, SSE chunks are written to the output variable which can be read in real time using repeat instruction. Change this behaviour to emit chunks as individual events instead.
             */
            stream?: {
                event: string;
                concatenate?: {
                    path?: string;
                    throttle?: number;
                };
                payload?: {
                    [name: string]: any;
                };
                target?: PrismeEventTarget;
                options?: PrismeEventOptions;
            };
            outputMode?: "body" | "detailed_response" | "data_url";
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
        /**
         * Reflects whether the file has public-read ACL at storage provider. True by default
         */
        public?: boolean;
        /**
         * A share token to append as a ?token query parameter to grant read access with given url
         */
        shareToken?: string;
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
         * runtime.waits.fulfilled
         */
        type: "runtime.waits.fulfilled";
        payload: {
            id: string;
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
        payload: {
            [name: string]: any;
            type?: string;
            message: string;
            details?: {
                [name: string]: any;
            };
        };
    }
    export interface ImportedWorkspace {
        /**
         * example:
         * workspaces.imported
         */
        type: "workspaces.imported";
        payload: {
            workspace: Workspace;
            files: string[];
            deleted?: string[];
            version?: WorkspaceVersion;
            errors?: {
                [name: string]: any;
            }[];
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
            events?: ProcessedEvents;
        };
    }
    export type Instruction = Emit | Wait | Set | Delete | Conditions | Repeat | All | Break | Fetch | Comment | {
        [name: string]: any;
    };
    export type InstructionList = Instruction[];
    export interface JoinUserTopic {
        joinUserTopic: {
            /**
             * example:
             * conversation:56
             */
            topic: string;
            /**
             * Subscribing user ids. If undefined, defaults to current user
             */
            userIds?: string[];
            /**
             * Automatically create userTopic if it does not exist. Defaults: true
             */
            create?: boolean;
        };
    }
    export interface JoinedEventsNode {
        /**
         * example:
         * events.nodes.joined
         */
        type: "events.nodes.joined";
        payload: {
            [name: string]: any;
            id: string;
            targetTopic: string;
        };
    }
    export interface JoinedUserTopic {
        /**
         * example:
         * events.userTopics.joined
         */
        type: "events.userTopics.joined";
        payload: {
            user: {
                id?: string;
            };
            topic: string;
        };
    }
    export interface JoinedWorkspaceSubscriber {
        /**
         * example:
         * events.subscribers.joined
         */
        type: "events.subscribers.joined";
        payload: {
            [name: string]: any;
            workspaceId: string;
            userId: string;
            sessionId: string;
            socketId: string;
            filters?: {
                [name: string]: any;
                payloadQuery?: any;
            };
            permissions: PermissionRule[];
            targetTopic: string;
            oldSocketId?: string;
        };
    }
    export interface LeftEventsNode {
        /**
         * example:
         * events.nodes.left
         */
        type: "events.nodes.left";
        payload: {
            [name: string]: any;
            id: string;
            targetTopic: string;
        };
    }
    export interface LeftWorkspaceSubscriber {
        /**
         * example:
         * events.subscribers.left
         */
        type: "events.subscribers.left";
        payload: {
            [name: string]: any;
            workspaceId: string;
            userId: string;
            sessionId: string;
            socketId: string;
        };
    }
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
    export interface Page {
        name?: LocalizedText;
        description?: LocalizedText;
        workspaceId?: string;
        workspaceSlug?: string;
        id?: string;
        slug?: string;
        blocks?: {
            [name: string]: any;
            slug: string;
            appInstance?: string;
            onInit?: string | {
                event?: string;
                payload?: AnyValue;
            };
            updateOn?: string;
            automation?: string | {
                slug?: string;
                payload?: AnyValue;
            };
        }[];
        labels?: string /* ^[0-9A-Za-z._:-]{2,60}$ */[];
        events?: ProcessedEvents;
        createdBy?: string;
        updatedBy?: string;
        createdAt?: string;
        updatedAt?: string;
        permissions?: PermissionsMap;
        customDomains?: string[];
        styles?: string;
        onInit?: string | {
            event?: string;
            payload?: AnyValue;
        };
        updateOn?: string;
        notifyOn?: string;
        automation?: string | {
            slug?: string;
            payload?: AnyValue;
        };
    }
    export interface PageDetails {
        appInstances: {
            slug?: string;
            blocks?: {
                [name: string]: /* Block */ Block;
            } | {
                [name: string]: string;
            };
        }[];
        /**
         * Indicates whether this page is public. Reflects page permissions and cannot be set directly
         */
        public?: boolean;
        apiKey?: string;
        clientId?: string;
        favicon?: string;
    }
    /**
     * Page
     */
    export interface PageMeta {
        name: LocalizedText;
        description?: LocalizedText;
        workspaceId?: string;
        workspaceSlug?: string;
        id?: string;
        slug?: string;
        blocks?: {
            slug?: string;
            appInstance?: string;
        }[];
        labels?: string /* ^[0-9A-Za-z._:-]{2,60}$ */[];
        events?: ProcessedEvents;
        createdBy?: string;
        updatedBy?: string;
        createdAt?: string;
        updatedAt?: string;
        permissions?: PermissionsMap;
        customDomains?: string[];
    }
    export interface PagePermissionsDeleted {
        /**
         * example:
         * workspaces.pages.permissions.deleted
         */
        type: "workspaces.pages.permissions.deleted";
        payload: {
            subjectId: string;
            target: UserPermissionsTarget;
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
            target: UserPermissionsTarget;
            permissions: {
                role?: Role;
                policies?: Policies;
            };
        };
    }
    export type PatternLabel = string; // ^[0-9A-Za-z._:-]{2,60}$
    export type PatternLanguage = string; // ^[A-Za-z]{2,10}$
    export type PatternName = string; // ^[0-9A-Za-zéèê ,.'-]{2,60}$
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
    export interface PermissionRule {
        /**
         * The roles to which this rule is restricted
         */
        role?: /* The roles to which this rule is restricted */ string[] | string;
        /**
         * If true, will forbid instead of allow
         */
        inverted?: boolean;
        reason?: string;
        /**
         * The actions that we want to allow/deny
         */
        action: /* The actions that we want to allow/deny */ ActionTypes | ActionTypes[];
        subject: SubjectTypes | SubjectTypes[];
        /**
         * Matching conditions written using a subset of MongoDB queries. This rule will take effect only if conditions match (or are empty). See https://casl.js.org/v5/en/guide/conditions-in-depth
         */
        conditions?: {
            [name: string]: any;
        };
    }
    /**
     * example:
     * [
     *   {
     *     "target": {
     *       "id": "userId1"
     *     },
     *     "permissions": {
     *       "role": "admin"
     *     }
     *   },
     *   {
     *     "target": {
     *       "id": "userId2"
     *     },
     *     "permissions": {
     *       "policies": {
     *         "read": true
     *       }
     *     }
     *   },
     *   {
     *     "target": {
     *       "public": true
     *     },
     *     "permissions": {
     *       "policies": {
     *         "read": true
     *       }
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
    export interface PingEventsNode {
        /**
         * example:
         * events.nodes.ping
         */
        type: "events.nodes.ping";
        payload: {
            [name: string]: any;
            id: string;
            targetTopic: string;
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
            automationDepth?: number;
            userId?: string;
            ip?: string;
            sessionId?: string;
            workspaceId?: string;
            socketId?: string;
            host: {
                service: string;
            };
            correlationId: string;
            serviceTopic?: string;
        };
        payload?: AnyValue;
        target?: PrismeEventTarget;
        options?: PrismeEventOptions;
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
        size: number;
    }
    export interface PrismeEventOptions {
        /**
         * Whether to persist this event or not. Defaults to true
         */
        persist?: boolean;
    }
    export interface PrismeEventTarget {
        userTopic?: string;
        userId?: string;
        sessionId?: string;
        /**
         * If emitted in response to an active socket (i.e source.socketId is set), this event is only visible to this same socket. Defaults to true
         */
        currentSocket?: boolean;
    }
    export interface ProcessedEvents {
        emit?: string[];
        listen?: string[];
        autocomplete?: {
            /**
             * example:
             * prismeaiMessenger.message
             */
            event: string;
            autocomplete?: EmitAutocomplete;
        }[];
    }
    export interface PublishedApp {
        /**
         * example:
         * apps.published
         */
        type: "apps.published";
        payload: {
            app: App;
            /**
             * Whether we should rebuild this app model, true when this follows a bulk import
             */
            rebuildModel?: boolean;
        };
    }
    export interface PublishedWorkspaceVersion {
        /**
         * example:
         * workspaces.versions.published
         */
        type: "workspaces.versions.published";
        payload: {
            version: WorkspaceVersion;
        };
    }
    export interface Repeat {
        /**
         * One of "on" or "until" is required
         */
        repeat: /* One of "on" or "until" is required */ {
            on: string;
            do: InstructionList;
            until?: number;
        } | {
            until: number;
            do: InstructionList;
        };
    }
    export type Role = string;
    export interface RuntimeModel {
        name: string; // ^[0-9A-Za-zéèê ,.'-]{2,60}$
        description?: LocalizedText;
        photo?: string;
        config?: Config;
        blocks?: {
            [name: string]: /* Block */ Block;
        };
        slug?: string;
        id?: string;
        labels?: string /* ^[0-9A-Za-z._:-]{2,60}$ */[];
        customDomains?: string[];
        /**
         * If true, make this workspace metadata available to all workspaces with this variable : {{global.workspacesRegistry[WORKSPACE_SLUG]}}
         */
        registerWorkspace?: boolean;
        /**
         * Remote versioning repositories
         */
        repositories?: {
            [name: string]: WorkspaceRepository;
        };
        secrets?: {
            schema?: {
                [name: string]: TypedArgument;
            };
        };
        automations?: {
            [name: string]: Automation;
        };
        imports?: {
            [name: string]: AppInstance;
        };
    }
    export interface ScheduledAutomation {
        /**
         * example:
         * runtime.automations.scheduled
         */
        type: "runtime.automations.scheduled";
        payload: {
            slug: string;
            schedules: /**
             * example:
             * [
             *   "2021-12-25T00:00",
             *   "* * 1 * *"
             * ]
             */
            Schedules;
            details?: {
                [name: string]: any;
            };
        };
    }
    /**
     * example:
     * [
     *   "2021-12-25T00:00",
     *   "* * 1 * *"
     * ]
     */
    export type Schedules = string[];
    export interface Set {
        set: {
            /**
             * Variable name, might be "foo", "session.sessionScopedFoo", "global.globalScopedFoo", "user.userScopedFoo", ...
             */
            name: string;
            /**
             * The ID of the schema form representing the structure of the value
             */
            interface?: string;
            /**
             * variable value
             */
            value: AnyValue;
            /**
             * Choose merge in order to merge target variable with value. Value takes precedence.
             */
            type?: "replace" | "merge" | "push";
        };
    }
    export type SharableSubjectTypes = "pages" | "workspaces";
    export type SubjectTypes = "apps" | "pages" | "files" | "events" | "workspaces" | "automations";
    export interface SucceededLogin {
        /**
         * example:
         * gateway.login.succeeded
         */
        type: "gateway.login.succeeded";
        payload: {
            ip?: string;
            email?: string;
            id: string;
            provider?: string;
            authData: {
                [name: string]: AuthData;
            };
            session: {
                id: string;
                /**
                 * Expires in N seconds
                 */
                expiresIn: number;
                /**
                 * Expires ISODate
                 */
                expires: string;
            };
        };
    }
    export interface SucceededPasswordReset {
        /**
         * example:
         * gateway.passwordReset.succeeded
         */
        type: "gateway.passwordReset.succeeded";
        payload: {
            ip: string;
            email: string;
        };
    }
    export interface SucceededPasswordResetRequested {
        /**
         * example:
         * gateway.passwordReset.requested
         */
        type: "gateway.passwordReset.requested";
        payload: {
            ip: string;
            email: string;
        };
    }
    export interface SucceededSignup {
        /**
         * example:
         * gateway.signup.succeeded
         */
        type: "gateway.signup.succeeded";
        payload: {
            ip: string;
            user: User;
        };
    }
    export type SupportedMFA = "totp" | "none" | "*";
    export interface SuspendedWorkspace {
        /**
         * example:
         * workspaces.suspended
         */
        type: "workspaces.suspended";
        payload: {
            workspaceId: string;
            suspended: boolean;
            reason: string;
        };
    }
    export type TriggerType = "event" | "endpoint" | "schedule" | "automation";
    export interface TriggeredInteraction {
        /**
         * example:
         * runtime.interactions.triggered
         */
        type: "runtime.interactions.triggered";
        payload: {
            workspaceId: string;
            sourceWorkspaceId?: string;
            automation: string;
            trigger: {
                type: TriggerType;
                value: string;
                id?: string;
                appInstanceSlug?: string;
            };
            startedAt: string;
        };
    }
    export interface TypedArgument {
        type?: "string" | "number" | "object" | "array" | "boolean" | "localized:string" | "localized:number" | "localized:boolean";
        properties?: {
            [name: string]: TypedArgument;
        };
        title?: LocalizedText;
        description?: LocalizedText;
        items?: TypedArgument;
        "ui:widget"?: string;
        "ui:options"?: {
            [key: string]: any;
        };
        secret?: boolean;
        event?: boolean;
    }
    export interface UninstalledAppInstance {
        /**
         * example:
         * workspaces.apps.uninstalled
         */
        type: "workspaces.apps.uninstalled";
        payload: {
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
            subjectType: "workspaces";
            subjectId: string;
            rules: PermissionRule[];
        };
    }
    export interface UpdatedAutomation {
        /**
         * example:
         * workspaces.automations.updated
         */
        type: "workspaces.automations.updated";
        payload: {
            automation: Automation;
            slug: string;
            /**
             * Filled with the previous automation slug when renamed
             */
            oldSlug?: string;
            events?: ProcessedEvents;
        };
    }
    export interface UpdatedBlocks {
        /**
         * example:
         * workspaces.blocks.updated
         */
        type: "workspaces.blocks.updated";
        payload: {
            blocks: {
                [name: string]: /* Block */ Block;
            };
            workspaceSlug: string;
        };
    }
    export interface UpdatedContexts {
        /**
         * example:
         * runtime.contexts.updated
         */
        type: "runtime.contexts.updated";
        payload: {
            updateId: string;
            updates: {
                type: ContextSetType;
                path: string;
                fullPath: string;
                context: string;
                value?: any;
            }[];
        };
    }
    export interface UpdatedJWKS {
        /**
         * example:
         * gateway.jwks.updated
         */
        type: "gateway.jwks.updated";
        payload: {
            created: string[];
            deleted: string[];
        };
    }
    export interface UpdatedPage {
        /**
         * example:
         * workspaces.pages.updated
         */
        type: "workspaces.pages.updated";
        payload: {
            page: Page;
            slug: string;
            /**
             * Filled with the previous page slug when renamed
             */
            oldSlug?: string;
            events?: ProcessedEvents;
        };
    }
    export interface UpdatedRuntimeDSUL {
        /**
         * example:
         * runtime.dsul.updated
         */
        type: "runtime.dsul.updated";
        payload: {
            workspaceId: string;
        };
    }
    export interface UpdatedUser {
        /**
         * example:
         * gateway.users.updated
         */
        type: "gateway.users.updated";
        payload: {
            user: User;
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
            oldSlug?: string;
            migrated?: string;
        };
    }
    export interface UpdatedWorkspaceSecrets {
        /**
         * example:
         * workspaces.secrets.updated
         */
        type: "workspaces.secrets.updated";
        payload: {
            created?: string[];
            updated?: string[];
            deleted?: string[];
        };
    }
    export interface UpdatedWorkspaceSecurity {
        /**
         * example:
         * workspaces.security.updated
         */
        type: "workspaces.security.updated";
        payload: {
            security: WorkspaceSecurity;
        };
    }
    export interface UsageMetrics {
        transactions: number;
        httpTransactions: number;
        eventTransactions: number;
        scheduleTransactions: number;
        sessions: number;
        users: number;
    }
    export interface User {
        /**
         * example:
         * foo@prisme.ai
         */
        email?: string;
        status?: "pending" | "validated" | "deactivated" | "pending" | "validated" | "deactivated";
        language?: string;
        authData?: {
            [name: string]: any;
            anonymous?: {
                [key: string]: any;
            };
            prismeai?: {
                [key: string]: any;
            };
            azure?: AuthData;
        };
        mfa?: SupportedMFA;
        meta?: {
            [key: string]: any;
        };
        platformRole?: string;
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
        groups?: string[];
        /**
         * Unique id
         */
        id?: string;
    }
    export interface UserPermissions {
        target: UserPermissionsTarget;
        permissions: {
            role?: Role;
            policies?: Policies;
        };
    }
    export type UserPermissionsTarget = {
        id: string;
        public?: boolean;
        role?: string;
        displayName?: string;
    } | {
        id?: string;
        public: boolean;
        role?: string;
        displayName?: string;
    } | {
        id?: string;
        public?: boolean;
        role: string;
        displayName?: string;
    };
    export interface UserTopic {
        /**
         * example:
         * conversation:56
         */
        topic: string;
        /**
         * Subscribing user ids
         */
        userIds?: string[];
    }
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
        schedules?: /**
         * example:
         * [
         *   "2021-12-25T00:00",
         *   "* * 1 * *"
         * ]
         */
        Schedules;
        endpoint?: boolean | string;
    } | {
        /**
         * example:
         * [
         *   "prismeaiMessenger.event"
         * ]
         */
        events?: string[];
        schedules: /**
         * example:
         * [
         *   "2021-12-25T00:00",
         *   "* * 1 * *"
         * ]
         */
        Schedules;
        endpoint?: boolean | string;
    } | {
        /**
         * example:
         * [
         *   "prismeaiMessenger.event"
         * ]
         */
        events?: string[];
        schedules?: /**
         * example:
         * [
         *   "2021-12-25T00:00",
         *   "* * 1 * *"
         * ]
         */
        Schedules;
        endpoint: boolean | string;
    };
    export type Workspace = DSUL;
    export interface WorkspaceAuthorizations {
        roles?: {
            [name: string]: WorkspaceRole;
        };
        rules?: PermissionRule[];
    }
    export interface WorkspacePermissionsDeleted {
        /**
         * example:
         * workspaces.permissions.deleted
         */
        type: "workspaces.permissions.deleted";
        payload: {
            subjectId: string;
            target: UserPermissionsTarget;
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
            target: UserPermissionsTarget;
            permissions: {
                role?: Role;
                policies?: Policies;
            };
        };
    }
    export interface WorkspaceRepository {
        name: string;
        type?: "git" | "archive";
        mode?: "read-write" | "read-only";
        config: {
            url: string;
            branch: string;
            auth?: {
                user?: string;
                password?: string;
                sshkey?: string;
            };
        } | {
            [key: string]: any;
        };
        pull?: {
            exclude?: {
                path: string;
            }[];
        };
    }
    export interface WorkspaceRole {
        description?: string;
        auth?: {
            prismeai?: {
                conditions?: {
                    [name: string]: any;
                };
            };
            azure?: {
                conditions?: {
                    [name: string]: any;
                };
            };
            basic?: {
                username?: string;
                password?: string;
            };
            apiKey?: {
                [key: string]: any;
            };
        };
    }
    /**
     * example:
     * {
     *   "openaiApiKey": {
     *     "value": "some secret api key"
     *   },
     *   "allowedModels": {
     *     "value": [
     *       "gpt4",
     *       "gpt4o"
     *     ]
     *   }
     * }
     */
    export interface WorkspaceSecrets {
        [name: string]: {
            id?: string;
            value: any;
            description?: string;
            createdBy?: string;
            updatedBy?: string;
            createdAt?: string;
            updatedAt?: string;
            permissions?: PermissionsMap;
        };
    }
    export interface WorkspaceSecurity {
        authorizations?: WorkspaceAuthorizations;
        authentication?: {
            clientId?: string;
        };
    }
    export interface WorkspaceSystemSecrets {
        prismeai_ratelimit_disabled?: any;
        prismeai_ratelimit_automations?: any;
        prismeai_ratelimit_emits?: any;
        prismeai_ratelimit_fetchs?: any;
        prismeai_ratelimit_repeats?: any;
        prismeai_ratelimit_automations_burst?: any;
        prismeai_ratelimit_emits_burst?: any;
        prismeai_ratelimit_fetchs_burst?: any;
        prismeai_ratelimit_repeats_burst?: any;
    }
    export interface WorkspaceUsage {
        workspaceId: string;
        beforeDate: string;
        afterDate: string;
        interval?: string;
        total: UsageMetrics;
        timeseries?: {
            date?: string;
            total?: UsageMetrics;
            apps?: AppUsageMetrics[];
        }[];
        apps: AppUsageMetrics[];
    }
    export interface WorkspaceVersion {
        /**
         * Version name. If left empty, will be auto generated
         */
        name?: string;
        createdAt?: string;
        description: LocalizedText;
        repository?: {
            /**
             * Source or dest repository id as described in workspace configuration
             */
            id?: string;
        };
    }
}
declare namespace PrismeaiAPI {
    namespace AnonymousAuth {
        export interface RequestBody {
            /**
             * Optional session expiration in seconds
             */
            expiresAfter?: number;
        }
        namespace Responses {
            export interface $200 {
                /**
                 * example:
                 * foo@prisme.ai
                 */
                email?: string;
                status?: "pending" | "validated" | "deactivated" | "pending" | "validated" | "deactivated";
                language?: string;
                authData?: {
                    [name: string]: any;
                    anonymous?: {
                        [key: string]: any;
                    };
                    prismeai?: {
                        [key: string]: any;
                    };
                    azure?: Prismeai.AuthData;
                };
                mfa?: Prismeai.SupportedMFA;
                meta?: {
                    [key: string]: any;
                };
                platformRole?: string;
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
                groups?: string[];
                /**
                 * Unique id
                 */
                id?: string;
                sessionId: string;
                expires?: string;
            }
            export type $401 = Prismeai.AuthenticationError;
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
        export type RequestBody = Prismeai.AnyValue;
        namespace Responses {
            export type $200 = Prismeai.AnyValue;
            export type $400 = Prismeai.GenericError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace AzureAuthCallback {
        export interface RequestBody {
            code?: string;
            client_info?: string;
            state?: string;
            session_state?: string;
        }
        namespace Responses {
            export interface $302 {
            }
        }
    }
    namespace AzureAuthInit {
        namespace Responses {
            export interface $302 {
            }
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
        export type RequestBody = Prismeai.AppInstance;
        namespace Responses {
            export type $200 = Prismeai.AppInstance;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace CreateAccessToken {
        export type RequestBody = Prismeai.AccessToken;
        namespace Responses {
            export type $200 = Prismeai.AccessToken;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
        }
    }
    namespace CreateApiKey {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export interface RequestBody {
            name: string;
            rules: Prismeai.PermissionRule[];
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
        export type RequestBody = Prismeai.Automation;
        namespace Responses {
            export type $200 = Prismeai.Automation;
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
        export type RequestBody = Prismeai.Page;
        namespace Responses {
            export type $200 = Prismeai.Page;
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
    namespace DeleteAccessToken {
        namespace Parameters {
            export type Token = string;
        }
        export interface PathParameters {
            token: Parameters.Token;
        }
        namespace Responses {
            export type $200 = Prismeai.AccessToken;
            export type $401 = Prismeai.AuthenticationError;
        }
    }
    namespace DeleteApiKey {
        namespace Parameters {
            export type ApiKey = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
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
                slug: string;
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
    namespace DeleteMeta {
        namespace Parameters {
            export type Key = string;
        }
        export interface PathParameters {
            key: Parameters.Key;
        }
        namespace Responses {
            export interface $200 {
                [name: string]: any;
            }
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
        }
    }
    namespace DeleteMyUser {
        namespace Responses {
            export interface $200 {
                success?: boolean;
            }
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
        }
    }
    namespace DeletePage {
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
    namespace DeleteUser {
        namespace Parameters {
            export type Token = string;
            export type UserId = string;
        }
        export interface PathParameters {
            userId: Parameters.UserId;
        }
        export interface QueryParameters {
            token?: Parameters.Token;
        }
        namespace Responses {
            export interface $200 {
                success?: boolean;
            }
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
    namespace DeleteWorkspaceSecret {
        namespace Parameters {
            export type SecretName = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            secretName: Parameters.SecretName;
        }
        namespace Responses {
            export interface $200 {
                secretName?: string;
            }
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace DeleteWorkspaceVersion {
        namespace Parameters {
            export type VersionId = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            versionId: Parameters.VersionId;
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
    namespace DuplicateWorkspaceVersion {
        namespace Parameters {
            export type VersionId = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            versionId: Parameters.VersionId;
        }
        namespace Responses {
            export type $200 = Prismeai.Workspace;
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
            export type Sort = "asc" | "desc";
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
            sort?: Parameters.Sort;
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
    namespace ExportMultipleWorkspaces {
        export interface RequestBody {
            workspaces?: {
                query?: {
                    [key: string]: any;
                };
                pagination?: {
                    limit?: number;
                    page?: number;
                };
            };
            includeApps?: boolean;
        }
        namespace Responses {
            export type $200 = string; // binary
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace ExportWorkspaceVersion {
        namespace Parameters {
            export type VersionId = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            versionId: Parameters.VersionId;
        }
        namespace Responses {
            export type $200 = string; // binary
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace FindContacts {
        namespace Parameters {
            export type Limit = number;
            export type Page = number;
        }
        export interface QueryParameters {
            page?: Parameters.Page;
            limit?: Parameters.Limit;
        }
        export interface RequestBody {
            email?: string;
            ids?: string[];
            firstName?: string; // ^[0-9A-Za-zéèê ,.'-]{2,60}$
            lastName?: string; // ^[0-9A-Za-zéèê ,.'-]{2,60}$
            authProvider?: string;
            status?: "pending" | "validated" | "deactivated";
            platformRole?: string;
            groups?: string[];
        }
        namespace Responses {
            export interface $200 {
                /**
                 * Total number of matching contacts
                 */
                size?: number;
                contacts: Prismeai.Contact[];
            }
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GenericAuthInit {
        namespace Parameters {
            export type Provider = string;
        }
        export interface QueryParameters {
            provider: Parameters.Provider;
        }
        namespace Responses {
            export interface $302 {
            }
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
            export type $200 = Prismeai.App;
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
            export interface $200 {
                /**
                 * App unique id
                 */
                appSlug?: string;
                appName?: Prismeai.LocalizedText;
                /**
                 * Defaults to the latest known app version
                 */
                appVersion?: string;
                /**
                 * Unique & human readable id across current workspace's appInstances, which will be used to call this app automations
                 */
                slug?: string;
                /**
                 * If disabled, this appInstance will be ignored during execution
                 */
                disabled?: boolean;
                labels?: string /* ^[0-9A-Za-z._:-]{2,60}$ */[];
                updatedAt?: string;
                createdAt?: string;
                updatedBy?: string;
                createdBy?: string;
                config?: Prismeai.Config;
                documentation?: Prismeai.Page;
            }
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
            export type $200 = Prismeai.Automation;
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
            export interface $200 {
                /**
                 * example:
                 * foo@prisme.ai
                 */
                email?: string;
                status?: "pending" | "validated" | "deactivated" | "pending" | "validated" | "deactivated";
                language?: string;
                authData?: {
                    [name: string]: any;
                    anonymous?: {
                        [key: string]: any;
                    };
                    prismeai?: {
                        [key: string]: any;
                    };
                    azure?: Prismeai.AuthData;
                };
                mfa?: Prismeai.SupportedMFA;
                meta?: {
                    [key: string]: any;
                };
                platformRole?: string;
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
                groups?: string[];
                /**
                 * Unique id
                 */
                id?: string;
                sessionId: string;
                expires?: string;
            }
            export type $401 = Prismeai.AuthenticationError;
        }
    }
    namespace GetPage {
        namespace Parameters {
            export type Slug = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            slug: Parameters.Slug;
        }
        namespace Responses {
            export type $200 = Prismeai.DetailedPage;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GetPageBySlug {
        namespace Parameters {
            export type PageSlug = string;
            export type WorkspaceSlug = string;
        }
        export interface PathParameters {
            workspaceSlug: Parameters.WorkspaceSlug;
            pageSlug: Parameters.PageSlug;
        }
        namespace Responses {
            export type $200 = Prismeai.DetailedPage;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GetPermissions {
        namespace Parameters {
            export type SubjectId = string;
            export type SubjectType = Prismeai.SharableSubjectTypes;
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
                 *     "target": {
                 *       "id": "userId1"
                 *     },
                 *     "permissions": {
                 *       "role": "admin"
                 *     }
                 *   },
                 *   {
                 *     "target": {
                 *       "id": "userId2"
                 *     },
                 *     "permissions": {
                 *       "policies": {
                 *         "read": true
                 *       }
                 *     }
                 *   },
                 *   {
                 *     "target": {
                 *       "public": true
                 *     },
                 *     "permissions": {
                 *       "policies": {
                 *         "read": true
                 *       }
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
    namespace GetRoles {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        namespace Responses {
            export type $200 = {
                name: string;
                description?: string;
            }[];
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GetSecurity {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        namespace Responses {
            export type $200 = Prismeai.WorkspaceSecurity;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GetWorkspace {
        namespace Parameters {
            export type Version = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export interface QueryParameters {
            version?: Parameters.Version;
        }
        namespace Responses {
            export type $200 = Prismeai.DSULReadOnly;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GetWorkspaceSecrets {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        namespace Responses {
            export type $200 = /**
             * example:
             * {
             *   "openaiApiKey": {
             *     "value": "some secret api key"
             *   },
             *   "allowedModels": {
             *     "value": [
             *       "gpt4",
             *       "gpt4o"
             *     ]
             *   }
             * }
             */
            Prismeai.WorkspaceSecrets;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace GetWorkspaces {
        namespace Parameters {
            export type Email = string;
            export type Ids = string;
            export type Labels = string;
            export type Limit = number;
            export type Name = string;
            export type Page = number;
            export type Slug = string;
            export type Sort = string;
        }
        export interface QueryParameters {
            page?: Parameters.Page;
            limit?: Parameters.Limit;
            labels?: Parameters.Labels;
            name?: Parameters.Name;
            slug?: Parameters.Slug;
            email?: Parameters.Email;
            sort?: Parameters.Sort;
            ids?: Parameters.Ids;
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
    namespace GlobalSearch {
        export interface RequestBody {
            scope?: "events";
            /**
             * Page size. Limit response documents, but aggregations still execute on all documents matching the given query
             */
            limit?: number;
            /**
             * Page number returned by response's documents field
             */
            page?: number;
            /**
             * Elasticsearch DSL query to filter response documents
             */
            query: {
                [name: string]: any;
            };
            /**
             * Elasticsearch aggregations executed on response documents
             */
            aggs?: {
                [name: string]: any;
            };
            /**
             * Elasticsearch runtime_mappings executed on runtime
             */
            runtime_mappings?: {
                [name: string]: any;
            };
            /**
             * Elasticsearch _source
             */
            source?: string[];
            sort?: {
                [name: string]: any;
            }[];
            /**
             * Get real total instead of 10000
             */
            track_total_hits?: boolean;
        }
        namespace Responses {
            export interface $200 {
                size?: number;
                documents?: {
                    [name: string]: any;
                }[];
                aggs?: {
                    [name: string]: any;
                };
            }
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace ImportExistingWorkspace {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export interface RequestBody {
            [name: string]: any;
            /**
             * Zip archive binary data
             */
            archive: string; // binary
        }
        namespace Responses {
            export type $200 = {
                processing?: boolean;
                message?: string;
            } | {
                createdWorkspaceIds?: string[];
                updatedWorkspaceIds?: string[];
                imported: string[];
                errors?: {
                    [name: string]: any;
                }[];
                workspace?: Prismeai.DSULReadOnly;
                publishedApps?: Prismeai.App[];
                deleted?: string[];
            };
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
        }
    }
    namespace ImportNewWorkspace {
        export interface RequestBody {
            [name: string]: any;
            /**
             * Zip archive binary data
             */
            archive: string; // binary
        }
        namespace Responses {
            export type $200 = {
                processing?: boolean;
                message?: string;
            } | {
                createdWorkspaceIds?: string[];
                updatedWorkspaceIds?: string[];
                imported: string[];
                errors?: {
                    [name: string]: any;
                }[];
                workspace?: Prismeai.DSULReadOnly;
                publishedApps?: Prismeai.App[];
                deleted?: string[];
            };
            export type $400 = Prismeai.BadParametersError;
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
    namespace ListAccessTokens {
        namespace Responses {
            export type $200 = Prismeai.AccessToken[];
            export type $401 = Prismeai.AuthenticationError;
        }
    }
    namespace ListApiKeys {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
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
            export type $200 = Prismeai.DetailedAppInstance[];
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
            export type Sort = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export interface QueryParameters {
            page?: Parameters.Page;
            limit?: Parameters.Limit;
            query?: Parameters.Query;
            sort?: Parameters.Sort;
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
            export type $200 = /* Page */ Prismeai.PageMeta[];
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace ListWorkspaceVersions {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        namespace Responses {
            export type $200 = Prismeai.WorkspaceVersion[];
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace MFA {
        export interface RequestBody {
            totp: string;
        }
        namespace Responses {
            export interface $200 {
                success: boolean;
            }
            export type $401 = Prismeai.AuthenticationError;
        }
    }
    namespace OauthCallback {
        namespace Parameters {
            export type Code = string;
            export interface Query {
                [name: string]: any;
            }
            export type Scope = string;
            export type State = string;
        }
        export interface QueryParameters {
            state?: Parameters.State;
            code?: Parameters.Code;
            scope?: Parameters.Scope;
            query?: Parameters.Query;
        }
        namespace Responses {
            export interface $302 {
            }
        }
    }
    namespace PatchMyUser {
        export interface RequestBody {
            firstName?: string; // ^[0-9A-Za-zéèê ,.'-]{2,60}$
            lastName?: string; // ^[0-9A-Za-zéèê ,.'-]{2,60}$
            meta?: {
                [name: string]: any;
            };
            photo?: string;
            language?: string; // ^[A-Za-z]{2,10}$
        }
        namespace Responses {
            export type $200 = Prismeai.User;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
        }
    }
    namespace PatchUser {
        namespace Parameters {
            export type UserId = string;
        }
        export interface PathParameters {
            userId: Parameters.UserId;
        }
        export interface RequestBody {
            firstName?: string; // ^[0-9A-Za-zéèê ,.'-]{2,60}$
            lastName?: string; // ^[0-9A-Za-zéèê ,.'-]{2,60}$
            status?: "pending" | "validated" | "deactivated";
            meta?: {
                [name: string]: any;
            };
            platformRole?: string;
            groups?: string[];
        }
        namespace Responses {
            export type $200 = Prismeai.User;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace PatchWorkspaceSecrets {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export type RequestBody = /**
         * example:
         * {
         *   "openaiApiKey": {
         *     "value": "some secret api key"
         *   },
         *   "allowedModels": {
         *     "value": [
         *       "gpt4",
         *       "gpt4o"
         *     ]
         *   }
         * }
         */
        Prismeai.WorkspaceSecrets;
        namespace Responses {
            export type $200 = /**
             * example:
             * {
             *   "openaiApiKey": {
             *     "value": "some secret api key"
             *   },
             *   "allowedModels": {
             *     "value": [
             *       "gpt4",
             *       "gpt4o"
             *     ]
             *   }
             * }
             */
            Prismeai.WorkspaceSecrets;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace PostUserPhoto {
        export interface RequestBody {
            /**
             * Photo as binary
             */
            photo: string; // binary
        }
        namespace Responses {
            export type $200 = Prismeai.User;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
        }
    }
    namespace PublishApp {
        export interface RequestBody {
            workspaceId: string;
            /**
             * An optional workspace version. If empty, will publish latest workspace version
             */
            workspaceVersion?: string;
            /**
             * App slug : Required on first publish
             */
            slug?: string;
            description?: Prismeai.LocalizedText;
            /**
             * An optional version name
             */
            name?: string;
        }
        namespace Responses {
            export type $200 = Prismeai.App;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
        }
    }
    namespace PublishWorkspaceVersion {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export type RequestBody = Prismeai.WorkspaceVersion;
        namespace Responses {
            export type $200 = Prismeai.WorkspaceVersion;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace PullWorkspaceVersion {
        namespace Parameters {
            export type VersionId = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            versionId: Parameters.VersionId;
        }
        export interface RequestBody {
            repository?: {
                id?: string;
            };
        }
        namespace Responses {
            export interface $200 {
                imported?: string[];
                errors?: {
                    [name: string]: any;
                }[];
                workspace?: {
                    [key: string]: any;
                };
                deleted?: string[];
            }
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace ResetPassword {
        export type RequestBody = {
            email: string;
            language?: string; // ^[A-Za-z]{2,10}$
        } | {
            token: string;
            /**
             * New user password
             */
            password: string;
        };
        namespace Responses {
            export type $200 = Prismeai.AnyValue;
            export type $400 = Prismeai.BadParametersError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace RevokePermissions {
        namespace Parameters {
            export type Id = string;
            export type SubjectId = string;
            export type SubjectType = Prismeai.SharableSubjectTypes;
        }
        export interface PathParameters {
            subjectType: Parameters.SubjectType;
            subjectId: Parameters.SubjectId;
            id: Parameters.Id;
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
    namespace Search {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export interface RequestBody {
            scope?: "events";
            /**
             * Page size. Limit response documents, but aggregations still execute on all documents matching the given query
             */
            limit?: number;
            /**
             * Page number returned by response's documents field
             */
            page?: number;
            /**
             * Elasticsearch DSL query to filter response documents
             */
            query: {
                [name: string]: any;
            };
            /**
             * Elasticsearch aggregations executed on response documents
             */
            aggs?: {
                [name: string]: any;
            };
            /**
             * Elasticsearch runtime_mappings executed on runtime
             */
            runtime_mappings?: {
                [name: string]: any;
            };
            /**
             * Elasticsearch _source
             */
            source?: string[];
            sort?: {
                [name: string]: any;
            }[];
            /**
             * Get real total instead of 10000
             */
            track_total_hits?: boolean;
        }
        namespace Responses {
            export interface $200 {
                size?: number;
                documents?: {
                    [name: string]: any;
                }[];
                aggs?: {
                    [name: string]: any;
                };
            }
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace SearchApps {
        namespace Parameters {
            export type Labels = string;
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
            labels?: Parameters.Labels;
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
    namespace SetMeta {
        export interface RequestBody {
            [name: string]: any;
        }
        namespace Responses {
            export interface $200 {
                [name: string]: any;
            }
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
        }
    }
    namespace SetupMFA {
        export interface RequestBody {
            method: Prismeai.SupportedMFA;
            currentPassword: string;
        }
        namespace Responses {
            export type $200 = {
                secret: string;
                qrImage: string;
            } | {
                method: string;
            };
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
        }
    }
    namespace Share {
        namespace Parameters {
            export type SubjectId = string;
            export type SubjectType = Prismeai.SharableSubjectTypes;
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
    namespace ShareFile {
        namespace Parameters {
            export type Id = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            id: Parameters.Id;
        }
        export interface RequestBody {
            /**
             * Returned share url will expire in N seconds
             */
            expiresIn?: number;
        }
        namespace Responses {
            export interface $200 {
                url?: string;
                expiresAt?: string;
                expiresIn?: number;
            }
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
        }
    }
    namespace Signup {
        export interface RequestBody {
            email: string;
            password: string;
            firstName: string; // ^[0-9A-Za-zéèê ,.'-]{2,60}$
            lastName: string; // ^[0-9A-Za-zéèê ,.'-]{2,60}$
            language?: string; // ^[A-Za-z]{2,10}$
        }
        namespace Responses {
            export type $200 = Prismeai.User;
            export type $400 = Prismeai.BadParametersError;
        }
    }
    namespace TestAutomation {
        namespace Parameters {
            export type AutomationSlug = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            automationSlug: Parameters.AutomationSlug;
        }
        export interface RequestBody {
            /**
             * Entire body will be passed as a payload to the triggered automation
             */
            payload?: Prismeai.AnyValue;
        }
        namespace Responses {
            export type $200 = Prismeai.AnyValue;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
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
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            apiKey: Parameters.ApiKey;
        }
        export interface RequestBody {
            name: string;
            rules: Prismeai.PermissionRule[];
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
        export type RequestBody = Prismeai.Automation;
        namespace Responses {
            export type $200 = Prismeai.Automation;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace UpdateFile {
        namespace Parameters {
            export type Id = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            id: Parameters.Id;
        }
        export interface RequestBody {
            /**
             * File expiration time in seconds
             */
            expiresAfter?: string;
            /**
             * Set to true to make uploaded file publicly available
             */
            public?: string;
            /**
             * If enabled, return a share token that will allow anybody access the file
             */
            shareToken?: string;
            metadata?: {
                [name: string]: any;
            };
        }
        namespace Responses {
            export type $200 = Prismeai.File[];
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
        }
    }
    namespace UpdatePage {
        namespace Parameters {
            export type Slug = string;
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
            slug: Parameters.Slug;
        }
        export type RequestBody = Prismeai.Page;
        namespace Responses {
            export type $200 = Prismeai.Page;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace UpdateSecurity {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export type RequestBody = Prismeai.WorkspaceSecurity;
        namespace Responses {
            export type $200 = Prismeai.WorkspaceSecurity;
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
        export type RequestBody = Prismeai.DSULPatch;
        namespace Responses {
            export type $200 = Prismeai.Workspace;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace UpdateWorkspaceSecrets {
        namespace Parameters {
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export type RequestBody = /**
         * example:
         * {
         *   "openaiApiKey": {
         *     "value": "some secret api key"
         *   },
         *   "allowedModels": {
         *     "value": [
         *       "gpt4",
         *       "gpt4o"
         *     ]
         *   }
         * }
         */
        Prismeai.WorkspaceSecrets;
        namespace Responses {
            export type $200 = /**
             * example:
             * {
             *   "openaiApiKey": {
             *     "value": "some secret api key"
             *   },
             *   "allowedModels": {
             *     "value": [
             *       "gpt4",
             *       "gpt4o"
             *     ]
             *   }
             * }
             */
            Prismeai.WorkspaceSecrets;
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
            /**
             * Accepts both binary data or dataURI (i.e data:...,base64:...)
             */
            file: string; // binary
            /**
             * File expiration time in seconds
             */
            expiresAfter?: string;
            /**
             * Set to true to make uploaded file publicly available
             */
            public?: string;
            /**
             * If enabled, return a share token that will allow anybody access the file
             */
            shareToken?: string;
        }
        namespace Responses {
            export type $200 = Prismeai.File[];
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
        }
    }
    namespace ValidateAccount {
        export type RequestBody = {
            email: string;
            language?: string; // ^[A-Za-z]{2,10}$
        } | {
            token: string;
        };
        namespace Responses {
            export type $200 = Prismeai.AnyValue;
            export type $400 = Prismeai.BadParametersError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
    namespace WorkspaceUsage {
        namespace Parameters {
            export type AfterDate = string;
            export type BeforeDate = string;
            export type Details = boolean;
            export type Interval = "month" | "day";
            export type WorkspaceId = string;
        }
        export interface PathParameters {
            workspaceId: Parameters.WorkspaceId;
        }
        export interface QueryParameters {
            afterDate: Parameters.AfterDate;
            beforeDate: Parameters.BeforeDate;
            interval?: Parameters.Interval;
            details?: Parameters.Details;
        }
        namespace Responses {
            export type $200 = Prismeai.WorkspaceUsage;
            export type $400 = Prismeai.BadParametersError;
            export type $401 = Prismeai.AuthenticationError;
            export type $403 = Prismeai.ForbiddenError;
            export type $404 = Prismeai.ObjectNotFoundError;
        }
    }
}
