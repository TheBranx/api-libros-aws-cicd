const express = require('express');
const pool = require('./db');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'api-libros-aws',
    version: '1.1.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/libros', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, titulo, autor, anio_publicacion, creado_en FROM libros ORDER BY id ASC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al consultar libros:', error.message);
    res.status(500).json({ error: 'Error interno del servidor al consultar libros' });
  }
});

app.get('/libros/:id', async (req, res) => {
  const { id } = req.params;
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) {
    return res.status(400).json({ error: 'El ID proporcionado debe ser un numero entero positivo valido' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, titulo, autor, anio_publicacion, creado_en FROM libros WHERE id = ?',
      [numId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: `Libro con id ${numId} no encontrado` });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error al obtener libro:', error.message);
    res.status(500).json({ error: 'Error interno del servidor al obtener el libro' });
  }
});

app.post('/libros', async (req, res) => {
  const { titulo, autor, anio_publicacion } = req.body;

  if (!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
    return res.status(400).json({ error: 'El campo "titulo" es obligatorio y no puede estar vacio' });
  }

  if (!autor || typeof autor !== 'string' || autor.trim() === '') {
    return res.status(400).json({ error: 'El campo "autor" es obligatorio y no puede estar vacio' });
  }

  const anio = Number(anio_publicacion);
  if (anio_publicacion === undefined || anio_publicacion === null || !Number.isInteger(anio) || anio <= 0) {
    return res.status(400).json({ error: 'El campo "anio_publicacion" debe ser un numero entero valido y positivo' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO libros (titulo, autor, anio_publicacion) VALUES (?, ?, ?)',
      [titulo.trim(), autor.trim(), anio]
    );

    const nuevoLibro = {
      id: result.insertId,
      titulo: titulo.trim(),
      autor: autor.trim(),
      anio_publicacion: anio
    };

    res.status(201).json(nuevoLibro);
  } catch (error) {
    console.error('Error al insertar libro:', error.message);
    res.status(500).json({ error: 'Error interno del servidor al registrar el libro' });
  }
});

app.put('/libros/:id', async (req, res) => {
  const { id } = req.params;
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) {
    return res.status(400).json({ error: 'El ID proporcionado debe ser un numero entero positivo valido' });
  }

  const { titulo, autor, anio_publicacion } = req.body;

  if (!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
    return res.status(400).json({ error: 'El campo "titulo" es obligatorio y no puede estar vacio' });
  }

  if (!autor || typeof autor !== 'string' || autor.trim() === '') {
    return res.status(400).json({ error: 'El campo "autor" es obligatorio y no puede estar vacio' });
  }

  const anio = Number(anio_publicacion);
  if (anio_publicacion === undefined || anio_publicacion === null || !Number.isInteger(anio) || anio <= 0) {
    return res.status(400).json({ error: 'El campo "anio_publicacion" debe ser un numero entero valido y positivo' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE libros SET titulo = ?, autor = ?, anio_publicacion = ? WHERE id = ?',
      [titulo.trim(), autor.trim(), anio, numId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `Libro con id ${numId} no encontrado para actualizar` });
    }

    res.status(200).json({
      id: numId,
      titulo: titulo.trim(),
      autor: autor.trim(),
      anio_publicacion: anio,
      message: 'Libro actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar libro:', error.message);
    res.status(500).json({ error: 'Error interno del servidor al actualizar el libro' });
  }
});

app.delete('/libros/:id', async (req, res) => {
  const { id } = req.params;
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) {
    return res.status(400).json({ error: 'El ID proporcionado debe ser un numero entero positivo valido' });
  }

  try {
    const [result] = await pool.query('DELETE FROM libros WHERE id = ?', [numId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `Libro con id ${numId} no encontrado para eliminar` });
    }

    res.status(200).json({
      message: 'Libro eliminado exitosamente',
      id: numId
    });
  } catch (error) {
    console.error('Error al eliminar libro:', error.message);
    res.status(500).json({ error: 'Error interno del servidor al eliminar el libro' });
  }
});

module.exports = app;
