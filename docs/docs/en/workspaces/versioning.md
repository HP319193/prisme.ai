# Versioning

Workspace versioning allows you to save current workspace state on a remote git repository, synchronize distinct platforms through a shared repository, update workspaces from your own code editor, and much more.  

Once a repository is configured, you can either push to it or pull from it as simply as a few clicks from the workspace action menu on the studio.  

A native repository named `Prismeai` is always available in versioning UI, so anybody can save his version alongside current working state on the platform native storage. Note that any version saved with `Prismeai` would be lost as soon as the workspace itself is deleted.  
This is not the case with remote git repositories, as deleting a workspace does not affect its configured repositories.  

Versioning only save the workspace static configuration, including security roles, automations, pages, blocks and apps but does not save external data like events, collections content, crawled documents, uploaded files, ...  
The versioned content is the same as included in the generated archive when using export feature.  

## Configuration

Access workspace raw configuration by clicking on "Edit source code" in the workspace action menu.  
Paste the following sample configuration at the end of the file :  

```yaml
repositories:
  github:
    name: My Own Github
    type: git
    mode: read-write
    config:
      url: https://github.com/YourUser/your-repository.git
      branch: main
      auth:
        user: 'your git user'
        password: 'your git password'
```

Any git provider is supported (Gitlab, bitbucket, ...), and multiple repositories can be configured :  
```yaml
repositories:
  myRepo1:
    ...
  myRepo2:
    ...
```

You are free to name the repository key (github, myRepo1, myRepo2, ...) as you like, this is only a convenient identifier that will be used in API calls.  

If you want to use SSH authentication, use the following :  

```yaml
repositories:
  github:
    name: Github Perso
    type: git
    mode: read-write
    config:
      url: git@github.com:YourUser/your-repository.git
      branch: main
      auth:
        sshkey: |-
          YOUR SSH
          KEY
          HERE
```

**Note that the repository url must be prefixed with `git@` when using SSH, and `https://` when using user / password authentication.**  
Some git providers like Github forbid user password usage, instead requiring you to create a personal access token (that would be used as a normal password).  

The `mode` option allows you to restrict a repository to only `push` or `pull` action :  

* `read-write` : By default, can be used for both `push` and `pull`
* `read-only` : Only for `pull`
* `write-only` : Only for `push` 


