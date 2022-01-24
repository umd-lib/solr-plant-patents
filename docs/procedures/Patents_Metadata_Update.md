# Patents Metadata Update

This procedure is used merge updates to the "patents_metadata.csv" file in Box
into the "data.csv" file in the "solr-plant-patents" repository.

## Procedure Inputs/Outputs

### Inputs

* The "patents_metadata.csv" file (<https://umd.app.box.com/file/907935674011>)
in the "Plant Patents Digitization Project/Metadata" folder
(<https://umd.app.box.com/folder/3603951785>) has been updated.

### Outputs

* The “data.csv” file in solr-plant-patents has been updated.

## Docker Images

The following Docker images are used by this procedure:

* docker.lib.umd.edu/csv-validator:1.1.5-umd-0
* docker.lib.umd.edu/plant-patents-ingest:1.0.0
* bitnami/rclone:1.57.0

These Docker images should be available in the UMD Nexus prior to running
this procedure.

## Prerequisites

### Pre.1) Create Box access token

The following procedure uses "rclone" to retrieve files from Box. An access
token is needed to authorize "rclone" to access Box. To obtain an access token:

Pre. 1.1) On a local workstation, go to
<https://github.com/rclone/rclone/releases/tag/v1.57.0> and download the
appropriate Zip file for your operating system. For Mac OS, this will be
"rclone-v1.57.0-osx-amd64.zip".

Pre. 1.2) Unzip the downloaded file

Pre. 1.3) Switch into the "rclone" directory, and run the following command:

```bash
./rclone authorize "box"
```

A web browser will open, and display a Box login page. On the login page,
left-click "Use Single Sign On (SSO)" link, and fill out the resulting page
with your UMD email address. Then left-click the "Authorize" button.

Pre. 1.4) After completing the login, a page indicating that read/write access
to your Box account is being provided to "rclone". Left-click the
"Grant access to Box" button.

Pre. 1.5) In the terminal, an access token will be printed:

```text
Paste the following into your remote machine --->
{"access_token":...}
<---End paste
```

Copy the `{"access_token":...}` line. This will be referred to as
`<BOX_ACCESS_TOKEN>` in the steps below.

## Procedure

### 1) Log in to libdpiprocessing and switch service account

1.1) SSH to the "libdpiprocessing" server:

```bash
ssh libdpiprocessing.lib.umd.edu
```

1.2) Switch to the "dpiprocessing" service account:

```bash
su - dpiprocessing
```

### 2) Set up the environment variables

2.1) Export a "BASE_DIR" environment variable as the base of the Plant Patents
directory hierarchy on the server:

```bash
export BASE_DIR=/home/dpiprocessing/plant_patents
```

2.2) Export a "BOX_BASE_DIR" environment variable containing the base
    Plant Patents directory on Box:

```bash
export BOX_BASE_DIR="/Plant Patents Digitization Project"
```

### 3) Create Docker aliases

3.1) Run the following commands to create aliases to simplify the running of the
commands:

```bash
alias rclone_docker='docker run --rm --user `id -u`:`id -g` --env BOX_BASE_DIR="$BOX_BASE_DIR" --volume "$BASE_DIR/docker_mount":/tmp/host bitnami/rclone:1.57.0 --box-token "$BOX_ACCESS_TOKEN"'

alias ingest_docker='docker run --rm --user `id -u`:`id -g` --env BOX_BASE_DIR="$BOX_BASE_DIR" --volume "$BASE_DIR/docker_mount":/tmp/host docker.lib.umd.edu/plant-patents-ingest:1.0.0'

alias validator_docker='docker run --rm --volume "$BASE_DIR/docker_mount":/tmp/host docker.lib.umd.edu/csv-validator:1.1.5-umd-0'
```

### 4) Ensure solr-plant-patents repository is at the latest version

4.1) Switch to the "$BASE_DIR/solr-plant-patents" directory:

```bash
cd "$BASE_DIR/docker_mount/solr-plant-patents"
```

4.2) Use Git to checkout the "main" branch, and a "git pull" to ensure
repository is up-to-date:

```bash
git checkout main
git pull
```

### 5) Retrieve the "patents_metadata.csv" CSV file from Box

5.1) Sync the "patents_metadata.csv" file from Box:

```bash
rclone_docker sync  --progress :box:"$BOX_BASE_DIR"/Metadata/patents_metadata.csv /tmp/host/box/metadata
```

### 6) Validate the "patents_metadata.csv" file

6.1) Run the "csv-validator" Docker image:

```bash
validator_docker validate \
    /tmp/host/box/metadata/patents_metadata.csv \
    /tmp/host/solr-plant-patents/patents_metadata.csvs
```

Any validation errors will be displayed, otherwise "PASS" will be output.

**Note:** Validation errors should be reported back to STEM, and corrected
before going on to the next step.

### 7) Merge the "patents_metadata.csv" file into "data.csv"

7.1) Using the "merge_csv" tool from "umd-lib/plant-patents-ingest", merge
  the "scans_metadata.csv" file into the "data.csv" file, generating a
  "data_updated.csv" file:

```bash
ingest_docker merge_csv \
          --base-file /tmp/host/solr-plant-patents/data.csv \
          --merge-file /tmp/host/box/metadata/patents_metadata.csv \
          --skip-validation \
          --output-file /tmp/host/solr-plant-patents/data_updated.csv
```

**Note:** "--skip-validation" flag is used because the
"patents_metadata.csv" file is a "source of truth", so any differences are
resolved in favor of that file.

### 8) Update the derived Solr fields

8.1) Using the "derive_solr_fields" tool, derive the various Solr fields from
"data_updated.csv" file, creating a "data_updated_derived.csv file":

```bash
ingest_docker derive_solr_fields \
    --source-file /tmp/host/solr-plant-patents/data_updated.csv \
    --output-file /tmp/host/solr-plant-patents/data_updated_derived.csv
```

### 9) Replace the "data.csv" file

9.1) Rename the "data_updated_derived.csv" file to "data.csv":

```bash
mv $BASE_DIR/docker_mount/solr-plant-patents/data_updated_derived.csv $BASE_DIR/docker_mount/solr-plant-patents/data.csv
```

### 10) Validate the "data.csv" file

10.1) Switch to the "$BASE_DIR/docker_mount/solr-plant-patents" directory:

```bash
cd $BASE_DIR/docker_mount/solr-plant-patents
```

10.2) Run the "csv-validator" Docker image:

```bash
validator_docker validate \
    /tmp/host/solr-plant-patents/data.csv \
    /tmp/host/solr-plant-patents/data.csvs
```

Any validation errors will be displayed, otherwise "PASS" will be output.

**Note:** Validation errors indicate a problem with either the source data
or some other issue, which will need to be corrected before going on to the
next step.

10.3) Commit the changes in the "data.csv" file to the "solr-plant-patents":

```bash
git add data.csv
git commit
```

**Note:** The "fcrepo_urls.csv", "file_metadata.csv", and "scans_metadata.csv",
should *not* be committed.

10.4) Delete the temporary working files:

```bash
rm fcrepo_urls.csv
rm file_metadata.csv
rm scans_metadata.csv
```
