# Setup - libdpiprocessing Server

## Introduction

This document describes the setup of the "dpiprocessing" service account on the
"libdpiprocessing.lib.umd.edu" server for use in the Plant Patents Ingest
process.

## Applications Prerequsites

* Git
* Docker

The "docker-ce" and "docker-compose" clients should be loaded, and be usable by
the "dpiprocessing" service account.

## Git Repository Access Setup

### Git Repository Access

1) In the "dpiprocessing" service account, create a public/private keypair:

```bash
> su - dpiprocessing
> ssh-keygen -t rsa
(Just hit "Enter" to accept all the defaults. This created "~/.ssh/id_rsa" and
"~/.ssh/id_rsa.pub" files).
```

2) Add public key to "lib-ssdr-service" account on GitHib.

3) In the "dpiprocessing" service account home directory, edit the ".bashrc"
and add a "git_authors.sh" file as outlined in
<https://confluence.umd.edu/display/~mohideen/Git+Service+Account+Commits>

## "plant_patents" subdirectory Setup

The following steps creates the following subdirectory hierarchy in the
"dpiprocessing" service account home directory ("/home/dpiprocessing/"):

```text
plant_patents/
  |-- docker_mount/
       |-- box/
       |    |-- metadata (directory holding "patents_metadata.csv" from Box
       |    |-- PDFs (directory holding Plant Patents PDF scans from Box)
       |
       |-- plastron/ (directory to hold Plastron configuration file and logs)
       |-- solr-plant-patents/ (clone of the "solr-plant-patents" GitHub repository)
```

1) SSH to the "libdpiprocessing" server:

    ```bash
    ssh libdpiprocessing.lib.umd.edu
    ```

2) Switch to the "dpiprocessing" service account:

    ```bash
    su - dpiprocessing
    ```

3) Switch to the "dpiprocessing" service account home directory:

    ```bash
    cd ~
    ```

4) Construct the directories:

    ```bash
    mkdir plant_patents
    mkdir -p plant_patents/docker_mount/box/metadata
    mkdir -p plant_patents/docker_mount/box/PDFs
    mkdir -p plant_patents/plastron
    ```

5) Switch to the "plant_patents/docker_mount" directory and clone the
    "umd-lib/solr-plant-patents" GitHub repository:

    ```bash
    cd plant_patents/docker_mount
    git clone git@github.com:umd-lib/solr-plant-patents.git
    ```
