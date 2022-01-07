# solr-plant-patents

## Introduction

Note: Previous versions of this repository were used as a Solr configuration
directory on solr.lib.umd.edu. This repository has now been changed to support
creating a Docker image containing the data.

When making updates to the data or configuration, a new Docker image should be
created.

## Building the Docker Image

When building the Docker image, the "data.csv" file will be used to populate the
Solr database.

To build the Docker image named "docker.lib.umd.edu/solr-plant-patents":

```bash
> docker build -t docker.lib.umd.edu/solr-plant-patents .
```

To run the freshly built Docker container on port 8983:

```bash
> docker run -it --rm -p 8983:8983 docker.lib.umd.edu/solr-plant-patents
```

## CSV Validation

The Docker image is created using a Docker multi-stage build. The first
"validator" stage uses a "docker.lib.umd.edu/csv-validator" Docker image from
<https://github.com/umd-lib/csv-validator-docker> as the base image.

This first stage uses the "data.csvs" CSV schema file to validate the "data.csv"
file. If validation fails, the Docker build will terminate with an error message
describing the validation failures.

If the validation stage is succesful, the second "builder" stage uses an
official Solr Docker image as the base image to construct the
"solr-plant-patents" Docker image.

See <http://digital-preservation.github.io/csv-validator/> for information about
the validator tool, and
<https://digital-preservation.github.io/csv-schema/csv-schema-1.1.html> for
information about the CSV Schema.

## License

See the [LICENSE](LICENSE.txt) file for license rights and limitations.
