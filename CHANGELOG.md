# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-06-03

### Añadido
- Funcionalidad de registro e inicio de sesión de usuarios
- Dashboard principal con visualización de saldo
- Transferencia de dinero entre usuarios
- Historial de transacciones
- Gestión de contactos favoritos
- API RESTful para la gestión de transacciones y usuarios
- Autenticación basada en JWT
- Diseño responsive para móviles y web

### Seguridad
- Implementación de autenticación JWT
- Protección de rutas y endpoints
- Validación de datos en frontend y backend

### Técnico
- Frontend desarrollado en React Native/Expo
- Backend en Kotlin con Spring Boot
- Base de datos PostgreSQL

## [1.1.0] - 2025-06-05

### Añadido
- Integración completa con endpoint de depósito del backend
- Validaciones de CVU de 22 dígitos en pantalla de depósito
- Estados de carga y manejo de errores mejorado en DepositScreen
- Flujo completo de depósito: Fake Bank API → Backend → Confirmación

### Mejorado
- Servicio API con método `depositMoney()` integrado
- Experiencia de usuario en carga de dinero
- Mensajes de confirmación y error más informativos

### Técnico
- Actualización automática de saldo después de depósito exitoso
- Manejo de autenticación en llamadas API
- Logging mejorado para debugging