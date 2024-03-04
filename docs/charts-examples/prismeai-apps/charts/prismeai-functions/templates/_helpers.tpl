{{- define "imagePullSecret" }}
{{- with .Values.global.repository }}
{{- printf "{\"auths\": {\"%s\": {\"auth\": \"%s\"}}}" .host (printf "%s:%s" .username .token | b64enc) | b64enc }}
{{- end }}
{{- end }}

{{- define "imagePullSecretName" }}
{{- default .Values.imagePullSecretName "registry-secret" -}}
{{- end }}

{{- define "name" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "labels" -}}
helm.sh/chart: {{ include "chart" . }}
{{ include "selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
version: {{ default .Values.image.tag .Chart.AppVersion | quote }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "selectorLabels" -}}
app.kubernetes.io/name: {{ include "name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app: {{ include "name" . }}
{{- end -}}


{{/*
Create the name of the service account to use
*/}}
{{- define "serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
    {{ default (include "name" .) .Values.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.serviceAccount.name }}
{{- end -}}
{{- end -}}
