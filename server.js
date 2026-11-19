const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`Servidor API Libros iniciado en el puerto ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Endpoint de salud: http://localhost:${PORT}/health`);
  console.log(`Endpoint CRUD: http://localhost:${PORT}/libros`);
  console.log(`===================================================`);
});
