# Letter Service API

[![GitHub repo size](https://img.shields.io/github/repo-size/ministryofjustice/cica-apply-letter-service)](https://github.com/ministryofjustice/cica-apply-letter-service)
[![GitHub repo version](https://img.shields.io/github/package-json/v/ministryofjustice/cica-apply-letter-service)](https://github.com/ministryofjustice/cica-apply-letter-service/releases/latest)
[![GitHub repo npm version](https://img.shields.io/badge/npm_version->=10.8.2-blue)](https://github.com/ministryofjustice/cica-apply-letter-service/blob/master/package.json#L5)
[![GitHub repo node version](https://img.shields.io/badge/node_version->=22.8.0-blue)](https://github.com/ministryofjustice/cica-apply-letter-service/blob/master/package.json#L6)
[![GitHub repo contributors](https://img.shields.io/github/contributors/ministryofjustice/cica-apply-letter-service)](https://github.com/ministryofjustice/cica-apply-letter-service/graphs/contributors)
[![GitHub repo license](https://img.shields.io/github/package-json/license/ministryofjustice/cica-apply-letter-service)](https://github.com/ministryofjustice/cica-apply-letter-service/blob/master/LICENSE)

Letter Service API is a backend microservice responsible for handling letter-related operations within the Criminal Injuries Compensation Authority (CICA) system.  
It exposes a RESTful API built with Express and documented via OpenAPI/Swagger at the `/docs` endpoint.  
This service is typically consumed by internal applications and other supporting services.

---

## Prerequisites

-   Windows machine running **Docker Desktop**
-   **Node Version Manager (NVM)** installed globally <sup>(_recommended, not required_)</sup>
-   **NPM** `">=10.8.2"` installed globally
-   **Node** `">=22.8.0"` installed globally
-   (Optional) **Docker Compose** for orchestrating multiple services locally

---

## Installing Letter Service API

Clone the repository and install dependencies:

```bash
git clone https://github.com/ministryofjustice/cica-apply-letter-service.git
cd letter-service
npm install
```

You can then run the API locally for development:

```bash
npm run dev
```

Once started, the following endpoints are available:
- **Health check:** http://localhost:3000/health  
- **Swagger docs:** http://localhost:3000/docs  
- **OpenAPI JSON:** http://localhost:3000/openapi.json

---

## Using Letter Service API with Docker

You can run the API in Docker for consistent local environments:

```bash
docker build -t letter-service:dev --target dev .
docker run --rm -it -p 3000:3000 -v "$PWD:/app" letter-service:dev
```

Or run tests within the container:

```bash
docker build -t letter-service:test --target test .
```

For production:

```bash
docker build -t letter-service:prod --target prod .
docker run --rm -p 3000:3000 letter-service:prod
```

---

## Scripts

| Command | Description |
|----------|-------------|
| `npm run dev` | Start the API with Nodemon for development |
| `npm start` | Start the API normally |
| `npm test` | Run Jest test suite |
| `npm run lint` | Lint the codebase using ESLint |
| `npm run lint:fix` | Automatically fix lint issues |

---

## API Documentation

The API is described via an **OpenAPI 3.0** specification found in `openapi.json`.  
Swagger UI is automatically served at:  
[http://localhost:3000/docs](http://localhost:3000/docs)

---

## Contributors

Thanks to the following people who have contributed to this project:

-   [@BarryPiccinni](https://github.com/BarryPiccinni)
-   [@tjbburton](https://github.com/tjbburton)

---

## License

This project uses the following license: MIT.
