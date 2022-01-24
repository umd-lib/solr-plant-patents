# Add Plant Patents PDF Scans

This procedure is used for uploading new Plant Patents PDF scans into fcrepo,
and updating the "data.csv" file in the "solr-plant-patents" repository.

## Procedure Inputs/Outputs

### Inputs

* Patent scans are placed in "Plant Patents Digitization Project/PDFs" folder
    in Box (<https://umd.app.box.com/folder/3598931071?s=yijnsgrz0v0jj1yuq09czqkfs9e83h5i>

### Outputs

* Patent scans have been uploaded to fcrepo
* Patent scans have been placed in the
    "/processing/processing/archelon/plantpatents/binaries" directory on the
    libdpiprocessing.lib.umd.edu server.
* The “data.csv” file in solr-plant-patents has been updated.

## Docker Images

The following Docker images are used by this procedure:

* docker.lib.umd.edu/csv-validator:1.1.5-umd-0
* docker.lib.umd.edu/plant-patents-ingest:1.0.0
* docker.lib.umd.edu/plastrond:3.6.0rc6
* bitnami/rclone:1.57.0

Thee Docker images should be available in the UMD Nexus prior to running
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

### Pre.2) Create an fcrepo access token

Pre. 2.1) In a web browser on the local workstation, generate an fcrepo JWT
access token by going to:

<https://fcrepo.lib.umd.edu/fcrepo/user/token?subject=plastron&role=fedoraAdmin>

This will be referred to as `<FCREPO_ACCESS_TOKEN>` in the steps below.

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

2.3) Export an "ARCHIVE_BINARIES_DIR" environment variable containing the
directory where Plant Patents PDF scans are permanently stored:

```bash
export ARCHIVE_BINARIES_DIR="/processing/processing/archelon/plantpatents/binaries/"
```

2.4) Create a "BOX_ACCESS_TOKEN" environment variable where `<BOX_ACCESS_TOKEN>`
is the Box access token from the prerequisites:

```bash
export BOX_ACCESS_TOKEN='<BOX_ACCESS_TOKEN>'
```

### 3) Create Docker aliases

3.1) Run the following commands to create aliases to simplify the running of the
commands:

```bash
alias rclone_docker='docker run --rm --user `id -u`:`id -g` --env BOX_BASE_DIR="$BOX_BASE_DIR" --volume "$BASE_DIR/docker_mount":/tmp/host bitnami/rclone:1.57.0 --box-token "$BOX_ACCESS_TOKEN"'

alias ingest_docker='docker run --rm --user `id -u`:`id -g` --env BOX_BASE_DIR="$BOX_BASE_DIR" --volume "$BASE_DIR/docker_mount":/tmp/host --volume "$ARCHIVE_BINARIES_DIR":/tmp/archive_binaries docker.lib.umd.edu/plant-patents-ingest:1.0.0'

alias plastron_docker='docker run --rm --entrypoint "plastron" --user `id -u`:`id -g` --env BOX_BASE_DIR="$BOX_BASE_DIR" --volume "$BASE_DIR/docker_mount":/tmp/host docker.lib.umd.edu/plastrond:3.6.0rc6'

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

### 5) Retrieve the Plant Patents PDF scans from Box

5.1) Sync the Plant Patents PDF scans from the "PDFs/" directory on Box using
"rclone":

```bash
rclone_docker --progress sync :box:"$BOX_BASE_DIR"/PDFs /tmp/host/box/PDFs
```

### 6) Upload Plant Patents PDF scans to fcrepo using Plastron

6.1) Run the "create_plastron_batch" command to generate the
"plastron_batch.csv" file:

```bash
ingest_docker create_plastron_batch --root-dir /tmp/host/box/PDFs --output-file /tmp/host/plastron/plastron_batch.csv
```

6.2) Switch to the "$BASE_DIR/docker_mount/plastron" directory:

```bash
cd "$BASE_DIR/docker_mount/plastron"
```

6.4) Create a "config/fcrepo.yml" Plastron configuration file:

```bash
mkdir config
vi config/fcrepo.yml
```

with the following contents:

```text
REPOSITORY:
    REST_ENDPOINT: https://fcrepo.lib.umd.edu/fcrepo/rest
    RELPATH: /pcdm
    AUTH_TOKEN: <FCREPO_ACCESS_TOKEN>
    LOG_DIR: /tmp/host/plastron/logs/
```

where `<FCREPO_ACCESS_TOKEN>` is the JWT access token from the previous steps.

6.5) Load the Plant Patents PDF scans listed in the "plastron_batch.csv" file
using the Plastron "stub" command:

```bash
plastron_docker --config /tmp/host/plastron/config/fcrepo.yml stub \
    --identifier-column patent_number \
    --binary-column filepath \
    --rename-binary-column image_url \
    --member-of https://fcrepo.lib.umd.edu/fcrepo/rest/pcdm/db/c7/f3/44/dbc7f344-c0fa-49c9-af29-37270fa185c8 \
    --access umdaccess:Public \
    --container /pcdm \
    --output-file /tmp/host/solr-plant-patents/fcrepo_urls.csv \
    /tmp/host/plastron/plastron_batch.csv
```

**Note**: In the above the "--member-of" URL is the URL of the
"Plant Patents Image Database" collection in fcrepo.

### 7) Extract the file metadata from the downloaded PDFs

7.1) Run the "extract_binaries_metadata" command to create the
"files_metadata.csv" file:

```bash
ingest_docker extract_binaries_metadata \
    --root-dir /tmp/host/box/PDFs \
    --output-file /tmp/host/solr-plant-patents/file_metadata.csv
```

### 8) Create the "scans_metadata.csv" file

8.1) Run the "csvjoin" command to merge the "fcrepo_urls.csv" and
"files_metadata.csv" file into a "scans_metadata.csv" file:

```bash
ingest_docker csvjoin --no-inference --left --columns "patent_number" \
    /tmp/host/solr-plant-patents/file_metadata.csv \
    /tmp/host/solr-plant-patents/fcrepo_urls.csv >  \
    "$BASE_DIR/docker_mount/solr-plant-patents/scans_metadata.csv"
```

### 9) Merge the "scans_metadata.csv" file into "data.csv"

9.1) Using the "merge_csv" tool from "umd-lib/plant-patents-ingest", merge
  the "scans_metadata.csv" file into the "data.csv" file, generating a
  "data_updated.csv" file:

```bash
ingest_docker merge_csv \
    --base-file /tmp/host/solr-plant-patents/data.csv \
    --merge-file /tmp/host/solr-plant-patents/scans_metadata.csv \
    --output-file /tmp/host/solr-plant-patents/data_updated.csv
```

### 10) Update the derived Solr fields

10.1) Using the "derive_solr_fields" tool, derive the various Solr fields from
"data_updated.csv" file, creating a "data_updated_derived.csv file":

```bash
ingest_docker derive_solr_fields \
    --source-file /tmp/host/solr-plant-patents/data_updated.csv \
    --output-file /tmp/host/solr-plant-patents/data_updated_derived.csv
```

### 11) Replace the "data.csv" file

11.1) Rename the "data_updated_derived.csv" file to "data.csv":

```bash
mv "$BASE_DIR/docker_mount/solr-plant-patents/data_updated_derived.csv" \
    "$BASE_DIR/docker_mount/solr-plant-patents/data.csv"
```

### 12) Move the Plant Patents PDF scans to archive storage

12.1) Run the "organize_files" command to move the uploaded Plant Patents PDF
scans to the "/tmp/archive_binaries" directory:

```bash
ingest_docker organize_files \
    --source-directory /tmp/host/box/PDFs \
    --destination-directory /tmp/archive_binaries
```

### 13) Validate the "data.csv" file

13.1) Switch to the "$BASE_DIR/docker_mount/solr-plant-patents" directory:

```bash
cd "$BASE_DIR/docker_mount/solr-plant-patents"
```

13.2) Run the "csv-validator" Docker image:

```bash
validator_docker validate \
    /tmp/host/solr-plant-patents/data.csv \
    /tmp/host/solr-plant-patents/data.csvs
```

Any validation errors will be displayed, otherwise "PASS" will be output.

**Note:** Validation errors indicate a problem with either the source data
or some other issue, which will need to be corrected before going on to the
next step.

13.3) Commit the changes in the "data.csv" file to the "solr-plant-patents":

```bash
git add data.csv
git commit
```

**Note:** The "fcrepo_urls.csv", "file_metadata.csv", and "scans_metadata.csv",
should *not* be committed.

13.4) Delete the temporary working files:

```bash
rm fcrepo_urls.csv
rm file_metadata.csv
rm scans_metadata.csv
```
