# Catálogo de Libros API — AWS EC2 & Amazon RDS con CI/CD automatizado

[![CI - Integracion Continua](https://github.com/TheBranx/api-libros-aws-cicd/actions/workflows/ci.yml/badge.svg)](https://github.com/TheBranx/api-libros-aws-cicd/actions/workflows/ci.yml)
[![CD - Despliegue Continuo con Docker en EC2](https://github.com/TheBranx/api-libros-aws-cicd/actions/workflows/cd.yml/badge.svg)](https://github.com/TheBranx/api-libros-aws-cicd/actions/workflows/cd.yml)
![Node.js](https://img.shields.io/badge/Node.js-20.x%20LTS-green?logo=node.js)
![Docker](https://img.shields.io/badge/Docker-Multi--Stage-blue?logo=docker)
![AWS EC2](https://img.shields.io/badge/AWS-EC2%20Ubuntu%2024.04-orange?logo=amazon-aws)
![AWS RDS](https://img.shields.io/badge/AWS-RDS%20MySQL%208.4-blue?logo=mysql)

- **Carrera:** Ingeniería en Telecomunicaciones
- **Asignatura:** Trabajando en la Nube (COM610) - Semestre 2/2026
- **Docente:** Ing. Marcelo Quispe Ortega
- **Estudiante:** Vargas Alarcón Brayan Mario
- **Repositorio GitHub:** [https://github.com/TheBranx/api-libros-aws-cicd](https://github.com/TheBranx/api-libros-aws-cicd)
- **Docker Hub Registry:** [https://hub.docker.com/r/thebranx/api-libros](https://hub.docker.com/r/thebranx/api-libros)
- **IP Pública de Producción (EC2):** `52.15.197.239`

---

## Enlaces Públicos de Verificación y Flujos

- **Endpoint de Diagnóstico y Salud (Versión 1.1.0 activa):** [http://52.15.197.239/health](http://52.15.197.239/health)
- **Endpoint del Catálogo de Libros (RDS):** [http://52.15.197.239/libros](http://52.15.197.239/libros)
- **Ejecución Exitosa CI (Jest & Lint):** [Ver Run de CI en GitHub Actions](https://github.com/TheBranx/api-libros-aws-cicd/actions/workflows/ci.yml)
- **Ejecución Exitosa CD (Build, Push & Deploy en EC2):** [Ver Run de CD #2 en GitHub Actions](https://github.com/TheBranx/api-libros-aws-cicd/actions/runs/44642468474)

---

## Arquitectura de la Solución

```
                                  VPC por Defecto (us-east-2)
 ┌───────────────┐        ┌────────────────────────────────────────────────────────┐
 │               │        │                                                        │
 │ Cliente HTTP  │───────>│  [EC2: ec2-libros-brayan-vargas] (52.15.197.239)       │
 │ (curl/Postman)│ Puerto │  ┌─────────────────┐        ┌───────────────────────┐  │
 │               │   80   │  │  Proxy Inverso  │  HTTP  │  Contenedor Docker    │  │
 └───────────────┘        │  │     Nginx       │───────>│     api-libros        │  │
                          │  │  (Puerto 80)    │  3000  │  (Puerto 127.0.0.1)   │  │
                          │  └─────────────────┘        └──────────┬────────────┘  │
                          │                                        │               │
                          │  SG: ec2-libros-bmva                   │ MySQL         │
                          │  (Inbound: 80 0.0.0.0/0, 22 SSH)       │ 3306 (TCP)    │
                          │                                        ▼               │
                          │                     ┌───────────────────────────────┐  │
                          │                     │ [RDS: rds-libros-brayan-vargas│  │
                          │                     │  Motor: MySQL 8.4 LTS         │  │
                          │                     │  Acceso Público: NO (Privado) │  │
                          │                     │  SG: rds-libros-bmva          │  │
                          │                     │  (Inbound: 3306 desde EC2 SG) │  │
                          │                     └───────────────────────────────┘  │
                          └────────────────────────────────────────────────────────┘
```

---

## Recursos de AWS Utilizados

### 1. Servidor de Cómputo (Amazon EC2)
- **Nombre:** `ec2-libros-brayan-vargas`
- **ID de Instancia:** `i-0e1dbf22098df20e3`
- **Región / AZ:** `us-east-2` (Ohio) / `us-east-2c`
- **Tipo de Instancia:** `t3.micro` (Capa Gratuita)
- **Sistema Operativo:** Ubuntu Server 24.04 LTS (x86_64, AMI `ami-06013a79bb46505e8`)
- **IP Pública:** `52.15.197.239` | **IP Privada:** `172.31.32.254`
- **Grupo de Seguridad:** `ec2-libros-bmva` (`sg-00ea7f80c1b146176`)
  - Puerto 80 (HTTP) -> `0.0.0.0/0` (Acceso público web)
  - Puerto 22 (SSH) -> `0.0.0.0/0` (Para despliegue automatizado por GitHub Actions y gestión SSH)

### 2. Base de Datos Gestionada (Amazon RDS)
- **Identificador:** `rds-libros-brayan-vargas`
- **Motor:** MySQL Community 8.4.11 LTS
- **Tipo:** `db.t4g.micro` (Capa Gratuita, 20 GiB gp2)
- **Endpoint Privado:** `rds-libros-brayan-vargas.cfmko28ays3b.us-east-2.rds.amazonaws.com:3306`
- **Acceso Público:** **No (Deshabilitado / Totalmente Privado)**
- **Nombre de Base de Datos:** `db_libros`
- **Grupo de Seguridad:** `rds-libros-bmva` (`sg-0a146f9f199590cad`)
  - Puerto 3306 (MySQL) -> **Exclusivamente desde `sg-00ea7f80c1b146176` (Grupo de seguridad de EC2)**. No accesible desde Internet bajo ningún concepto.

---

## Ejecución Local y Pruebas

### 1. Clonar el repositorio
```bash
git clone https://github.com/TheBranx/api-libros-aws-cicd.git
cd api-libros-aws-cicd
```

### 2. Configurar Variables de Entorno
Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```
Edita `.env` con las credenciales de tu base de datos:
```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=secret
DB_NAME=db_libros
```

### 3. Instalar Dependencias y Ejecutar Pruebas Automatizadas
Las pruebas unitarias y de integración utilizan **Jest** y **Supertest** con un doble de prueba (Mock) de la capa de base de datos MySQL, por lo que no requieren una base de datos real activa:
```bash
npm ci
npm test
```

### 4. Compilar y Ejecutar con Docker Localmente
```bash
docker build -t api-libros:local .
docker run -d --name api-libros-local -p 3000:3000 --env-file .env api-libros:local
curl http://localhost:3000/health
```

---

## 📡 Referencia de la API REST

| Método | Endpoint | Código Esperado | Descripción |
|---|---|:---:|---|
| `GET` | `/health` | `200 OK` | Devuelve el estado del servicio, versión, tiempo activo y timestamp. |
| `GET` | `/libros` | `200 OK` | Devuelve el catálogo completo de libros almacenados en RDS. |
| `GET` | `/libros/:id` | `200 OK` / `404 Not Found` | Devuelve un libro por su ID o 404 si no existe. |
| `POST` | `/libros` | `201 Created` / `400 Bad Request` | Registra un nuevo libro. Valida que los campos no estén vacíos y el año sea entero. |
| `PUT` | `/libros/:id` | `200 OK` / `404 Not Found` | Actualiza un libro existente con consultas parametrizadas. |
| `DELETE` | `/libros/:id` | `200 OK` / `404 Not Found` | Elimina un libro del catálogo en RDS. |

### Ejemplos de Verificación con `curl`:

**1. Diagnóstico de Salud (versión 1.1.0):**
```bash
curl -i http://52.15.197.239/health
```

**2. Listar todos los libros:**
```bash
curl -s http://52.15.197.239/libros | jq .
```

**3. Crear un nuevo libro:**
```bash
curl -i -X POST http://52.15.197.239/libros \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Rayuela", "autor": "Julio Cortazar", "anio_publicacion": 1963}'
```

**4. Actualizar libro (ID 6):**
```bash
curl -i -X PUT http://52.15.197.239/libros/6 \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Rayuela (Edicion Conmemorativa)", "autor": "Julio Cortazar", "anio_publicacion": 1963}'
```

**5. Probar Validación (Error 400):**
```bash
curl -i -X POST http://52.15.197.239/libros \
  -H "Content-Type: application/json" \
  -d '{"titulo": "", "autor": "Anonimo", "anio_publicacion": "dos mil"}'
```

**6. Eliminar libro (ID 6):**
```bash
curl -i -X DELETE http://52.15.197.239/libros/6
```

---

## Flujo de CI/CD (GitHub Actions)

### 1. Integración Continua (`.github/workflows/ci.yml`)
- Se activa en cada `push` y `pull_request` hacia la rama `main`.
- Descarga el código fuente, prepara Node.js 20, ejecuta `npm ci` y corre la suite de pruebas unitarias (`npm test`).
- Si cualquier prueba falla, bloquea el proceso.

### 2. Despliegue Continuo (`.github/workflows/cd.yml`)
- Se activa **únicamente tras cambios confirmados (`push`) en la rama `main`**. Los `pull_request` no despliegan.
- **Estructura en 3 Jobs dependientes encadenados:**
  1. `test`: Ejecución obligatoria de pruebas automatizadas.
  2. `build-and-push`: Compila la imagen Docker multi-stage y la etiqueta semánticamente con el SHA del commit y `latest`, subiéndola a Docker Hub.
  3. `deploy`: Se conecta de forma segura por SSH a EC2, implementa **estrategia Zero-Downtime y Health Check**:
     - Levanta el nuevo contenedor en el puerto alternativo `3001` con `--env-file /home/ubuntu/.env`.
     - Verifica `/health` y `/libros` en el puerto provisional.
     - Si la validación es satisfactoria, detiene el contenedor antiguo y conmuta la nueva versión al puerto de producción `127.0.0.1:3000` (accesible únicamente a través del proxy Nginx).
     - **Rollback automático:** Si la nueva versión falla el health check, el workflow aborta con código de error y preserva la versión productiva anterior intacta.

---

## Galería de Evidencias

| N° | Evidencia | Archivo |
|:---:|---|---|
| 01 | Reglas de Entrada del Grupo de Seguridad de EC2 (`ec2-libros-bmva`) | [`01_sg_ec2_libros_inbound_rules.png`](./evidencias/01_sg_ec2_libros_inbound_rules.png) |
| 02 | Reglas de Entrada de RDS restringidas al SG de EC2 (`rds-libros-bmva`) | [`02_sg_rds_libros_inbound_rules.png`](./evidencias/02_sg_rds_libros_inbound_rules.png) |
| 03 | Instancia EC2 Linux en ejecución (`ec2-libros-brayan-vargas`) | [`03_ec2_instance_running.png`](./evidencias/03_ec2_instance_running.png) |
| 04 | Creación y aprovisionamiento de la base de datos en Amazon RDS | [`04_rds_databases_list_creating.png`](./evidencias/04_rds_databases_list_creating.png) |
| 05 | Resumen de configuración de Amazon RDS MySQL 8.4 | [`05_rds_details_summary.png`](./evidencias/05_rds_details_summary.png) |
| 06 | Conectividad privada de RDS (Acceso público: No) y SG asociado | [`06_rds_details_connectivity_sg.png`](./evidencias/06_rds_details_connectivity_sg.png) |
| 07 | Endpoint privado y puerto 3306 de la base de datos RDS | [`07_rds_endpoint_view.png`](./evidencias/07_rds_endpoint_view.png) |
| 08 | Repositorio público creado en GitHub (`api-libros-aws-cicd`) | [`08_github_repository_created.png`](./evidencias/08_github_repository_created.png) |
| 09 | Conexión SSH a EC2 y consultas SQL a la tabla `libros` en RDS | [`09_rds_mysql_cli_libros_table.png`](./evidencias/09_rds_mysql_cli_libros_table.png) |
| 10 | Verificación completa de operaciones CRUD y códigos HTTP en PowerShell | [`10_api_crud_endpoints_verification.png`](./evidencias/10_api_crud_endpoints_verification.png) |
| 11 | Ejecución de las 16 pruebas automatizadas con Jest y Supertest | [`11_jest_unit_tests_passed.png`](./evidencias/11_jest_unit_tests_passed.png) |
| 12 | Configuración segura de Repository Secrets en GitHub Actions | [`12_github_actions_secrets_configured.png`](./evidencias/12_github_actions_secrets_configured.png) |
| 13 | Vista general de workflows en verde en GitHub Actions | [`13_github_actions_workflows_overview_green.png`](./evidencias/13_github_actions_workflows_overview_green.png) |
| 14 | Ejecución exitosa de los 3 jobs del pipeline de CD | [`14_github_actions_cd_3jobs_success.png`](./evidencias/14_github_actions_cd_3jobs_success.png) |
| 15 | Log en vivo del despliegue en EC2 via SSH con Zero-Downtime | [`15_cd_deploy_ssh_live_log.png`](./evidencias/15_cd_deploy_ssh_live_log.png) |
| 16 | Comprobación de Health Check en `/health` y conmutación a producción | [`16_cd_deploy_healthcheck_switch.png`](./evidencias/16_cd_deploy_healthcheck_switch.png) |
| 17 | Actualización de reglas de SSH en Grupo de Seguridad de EC2 para runner de GitHub Actions | [`17_ec2_security_group_ssh_rules_updated.png`](./evidencias/17_ec2_security_group_ssh_rules_updated.png) |
| 18 | Despliegue de actualización v1.1.0 con los 3 jobs en verde en CD Run #2 | [`18_cd_run2_version_1_1_0_success_3jobs.png`](./evidencias/18_cd_run2_version_1_1_0_success_3jobs.png) |
| 19 | Vista general de ejecuciones CI y CD superadas en GitHub Actions | [`19_actions_overview_both_green.png`](./evidencias/19_actions_overview_both_green.png) |
| 20 | Comprobación externa en producción reflejando la nueva versión 1.1.0 en vivo | [`20_api_version_1_1_0_verified.png`](./evidencias/20_api_version_1_1_0_verified.png) |
| 21 | Publicación y versionado de imágenes con tags SHA y latest en Docker Hub | [`21_dockerhub_tags_published.png`](./evidencias/21_dockerhub_tags_published.png) |
