{{- define "imagePullSecret" }}
{{- with .Values.global.repository }}
{{- printf "{\"auths\": {\"%s\": {\"auth\": \"%s\"}}}" .host (printf "%s:%s" .username .token | b64enc) | b64enc }}
{{- end }}
{{- end }}

{{- define "imagePullSecretName" }}
{{- default .Values.imagePullSecretName "registry-secret" -}}
{{- end }}
