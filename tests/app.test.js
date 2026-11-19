const request = require('supertest');
const pool = require('../db');
const app = require('../app');

// Mock completo de la capa de base de datos MySQL (Double de prueba para CI y pruebas unitarias aisladas)
jest.mock('../db', () => ({
  query: jest.fn()
}));

describe('Suite de Pruebas Automatizadas - API Libros AWS (Jest & Supertest)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Endpoint de Diagnóstico y Salud (GET /health)', () => {
    it('Debe responder con código 200 y JSON indicando estado ok', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service', 'api-libros-aws');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('2. Consulta de Libros (GET /libros y GET /libros/:id)', () => {
    it('Debe retornar la lista completa de libros almacenados con estado 200', async () => {
      const librosFalsos = [
        { id: 1, titulo: 'Cien Anos de Soledad', autor: 'Gabriel Garcia Marquez', anio_publicacion: 1967 },
        { id: 2, titulo: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes', anio_publicacion: 1605 }
      ];
      pool.query.mockResolvedValueOnce([librosFalsos]);

      const response = await request(app).get('/libros');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].titulo).toBe('Cien Anos de Soledad');
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('Debe retornar un libro existente por su ID con estado 200', async () => {
      const libroFalso = { id: 1, titulo: '1984', autor: 'George Orwell', anio_publicacion: 1949 };
      pool.query.mockResolvedValueOnce([[libroFalso]]);

      const response = await request(app).get('/libros/1');
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.titulo).toBe('1984');
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
    });

    it('Debe retornar 404 si el libro consultado no existe en RDS', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const response = await request(app).get('/libros/9999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('no encontrado');
    });

    it('Debe responder 400 ante un ID invalido no numerico', async () => {
      const response = await request(app).get('/libros/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('3. Creacion de Libros (POST /libros)', () => {
    it('Debe crear un libro valido con persistencia en RDS y responder 201', async () => {
      const nuevoPayload = {
        titulo: 'El Principito',
        autor: 'Antoine de Saint-Exupery',
        anio_publicacion: 1943
      };
      pool.query.mockResolvedValueOnce([{ insertId: 3 }]);

      const response = await request(app)
        .post('/libros')
        .send(nuevoPayload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 3);
      expect(response.body.titulo).toBe('El Principito');
      expect(response.body.autor).toBe('Antoine de Saint-Exupery');
      expect(response.body.anio_publicacion).toBe(1943);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO libros'),
        ['El Principito', 'Antoine de Saint-Exupery', 1943]
      );
    });

    it('Debe rechazar con 400 cuando el titulo esta vacio o no se proporciona', async () => {
      const response = await request(app)
        .post('/libros')
        .send({ titulo: '', autor: 'Autor Valido', anio_publicacion: 2020 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('titulo');
    });

    it('Debe rechazar con 400 cuando el autor esta vacio o no se proporciona', async () => {
      const response = await request(app)
        .post('/libros')
        .send({ titulo: 'Titulo Valido', autor: '   ', anio_publicacion: 2020 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('autor');
    });

    it('Debe rechazar con 400 cuando anio_publicacion no es un entero valido', async () => {
      const response = await request(app)
        .post('/libros')
        .send({ titulo: 'Titulo Valido', autor: 'Autor Valido', anio_publicacion: 'dos mil veinte' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('anio_publicacion');
    });
  });

  describe('4. Actualizacion de Libros (PUT /libros/:id)', () => {
    it('Debe actualizar un libro existente con estado 200', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const response = await request(app)
        .put('/libros/1')
        .send({
          titulo: 'Cien Anos de Soledad (Edicion Conmemorativa)',
          autor: 'Gabriel Garcia Marquez',
          anio_publicacion: 2007
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.titulo).toBe('Cien Anos de Soledad (Edicion Conmemorativa)');
      expect(response.body.message).toContain('actualizado');
    });

    it('Debe responder 404 al intentar actualizar un libro inexistente', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const response = await request(app)
        .put('/libros/999')
        .send({
          titulo: 'Libro Fantasma',
          autor: 'Anonimo',
          anio_publicacion: 2000
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('no encontrado');
    });

    it('Debe responder 400 ante datos invalidos en la actualizacion', async () => {
      const response = await request(app)
        .put('/libros/1')
        .send({
          titulo: '',
          autor: 'Autor Valido',
          anio_publicacion: -50
        });

      expect(response.status).toBe(400);
    });
  });

  describe('5. Eliminacion de Libros (DELETE /libros/:id)', () => {
    it('Debe eliminar un libro existente y responder 200', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const response = await request(app).delete('/libros/1');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body.message).toContain('eliminado');
    });

    it('Debe responder 404 si el libro a eliminar no existe', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const response = await request(app).delete('/libros/9999');
      expect(response.status).toBe(404);
      expect(response.body.error).toContain('no encontrado');
    });

    it('Debe responder 400 si el ID a eliminar es invalido', async () => {
      const response = await request(app).delete('/libros/no-number');
      expect(response.status).toBe(400);
    });
  });

  describe('6. Manejo de Errores de Base de Datos', () => {
    it('Debe responder con estado 500 ante un error de conexion en GET /libros', async () => {
      pool.query.mockRejectedValueOnce(new Error('Conexion rechazada a RDS'));

      const response = await request(app).get('/libros');
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
