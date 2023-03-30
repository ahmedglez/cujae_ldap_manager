# Cujae LDAP Manager

The Cujae LDAP Manager is a Node.js-based web application for managing users and groups in an LDAP service. It is designed specifically for the Cujae University community, but can be easily adapted for use in other organizations.

## Features

- User and group management: create, edit, and delete users and groups in an LDAP directory.
- Authentication: users can authenticate against the LDAP server to access protected resources.
- Authorization: groups can be used to control access to protected resources.
- RESTful API: provides a simple and intuitive way to interact with the LDAP service programmatically.
- MongoDB integration: the application stores its configuration data in a MongoDB database, which makes it easy to scale and manage.

## Technology Stack

The Cujae LDAP Manager is built using the following technologies:

- Node.js: a JavaScript runtime that allows for building scalable and high-performance applications.
- Express: a popular web framework for Node.js that provides robust routing, middleware, and other features.
- LDAP: a protocol for accessing and managing distributed directory information services.
- MongoDB: a NoSQL document database that stores the application's configuration data.
- Docker: a containerization technology that provides a consistent and reproducible environment for running the application.

## Getting Started

The following instructions will help you get the Cujae LDAP Manager up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (version 14 or higher)
- [MongoDB](https://docs.mongodb.com/manual/installation/) (version 4 or higher)
- [Docker](https://docs.docker.com/get-docker/) (optional)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ahmedglez/cujae_ldap_manager.git
```

2. Install the dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory of the project and add the variables listed in the .env.example file.

4. Start the application:

```bash
npm run start
```

### Docker

The application can be run in a Docker container. To do so, follow these steps:

1. Build the Docker image:

```bash
docker build -t cujae_ldap_manager .
```

2. Run the Docker container:

```bash
docker run -p 3000:3000 cujae_ldap_manager
```

## Contributing

Contributions to the Cujae LDAP Manager are always welcome! Please refer to the [contribution guidelines](https://github.com/your/repo/blob/main/CONTRIBUTING.md) for more information.

## License

The Cujae LDAP Manager is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Acknowledgments

- [Node.js](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [LDAP](https://ldap.com/)
- [MongoDB](https://www.mongodb.com/)
- [Docker](https://www.docker.com/)
- [Swagger](https://swagger.io/)
- [Contributor Covenant](https://www.contributor-covenant.org/)
- [Choose a License](https://choosealicense.com/)
- [PurpleBooth](https://gist.github.com/PurpleBooth)
- [othneildrew](https://gist.github.com/othneildrew/)
- [Billie Thompson](https://gist.github.com/PurpleBooth)
<!-- Jingshao Chen <jingshaochen@gmail.com>", -->

- [All Contributors](Jingshao Chen <jingshaochen@gmail.com>)

## Authors

- **Ahmed Gonzalez** - [ahmedglez](Ahmed Gonzalez <ahmediglez@gmail.com>)
