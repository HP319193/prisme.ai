FROM alpine

ARG ARCH

# Ignore to update versions here
ARG HELM_VERSION=3.14.4
ARG KUBECTL_VERSION=1.30.0

# Install helm (latest release)
RUN case `uname -m` in \
    x86_64) ARCH=amd64; ;; \
    armv7l) ARCH=arm; ;; \
    aarch64) ARCH=arm64; ;; \
    ppc64le) ARCH=ppc64le; ;; \
    s390x) ARCH=s390x; ;; \
    *) echo "un-supported arch, exit ..."; exit 1; ;; \
    esac && \
    echo "export ARCH=$ARCH" > /envfile && \
    cat /envfile

RUN . /envfile && echo $ARCH && \
    apk add --update --no-cache curl ca-certificates bash git && \
    curl -sL https://get.helm.sh/helm-v${HELM_VERSION}-linux-${ARCH}.tar.gz | tar -xvz && \
    mv linux-${ARCH}/helm /usr/bin/helm && \
    chmod +x /usr/bin/helm && \
    rm -rf linux-${ARCH}


# Install kubectl
RUN . /envfile && echo $ARCH && \
    curl -sLO https://storage.googleapis.com/kubernetes-release/release/v${KUBECTL_VERSION}/bin/linux/${ARCH}/kubectl && \
    mv kubectl /usr/bin/kubectl && \
    chmod +x /usr/bin/kubectl

# Install awscli
# Temp fix to allow system-wide package installation:
# https://stackoverflow.com/a/76540031/3671801
RUN apk add --update --no-cache py3-pip && \
    pip3 install --break-system-packages --upgrade pip setuptools && \
    pip3 install --break-system-packages awscli && \
    pip3 cache purge

# Install jq
RUN apk add --update --no-cache jq yq

WORKDIR /apps
