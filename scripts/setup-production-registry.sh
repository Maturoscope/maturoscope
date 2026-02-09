#!/bin/bash

# 🚀 Script de Configuración del Container Registry de Producción OVH
# Este script te ayuda a verificar y configurar el registry localmente

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables del registry
REGISTRY_URL="tqgac9a3.gra7.container-registry.ovh.net"
REGISTRY_USERNAME="szZTahRucN"
REGISTRY_PASSWORD="5201R76Vv9438Tgh"

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Configuración del Container Registry de Producción OVH   ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Función para verificar si Docker está instalado
check_docker() {
    echo -e "${YELLOW}🔍 Verificando Docker...${NC}"
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker no está instalado. Por favor instala Docker primero.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker instalado: $(docker --version)${NC}"
    echo ""
}

# Función para hacer login en el registry
login_registry() {
    echo -e "${YELLOW}🔐 Intentando hacer login en el registry...${NC}"
    echo -e "Registry: ${BLUE}${REGISTRY_URL}${NC}"
    echo -e "Username: ${BLUE}${REGISTRY_USERNAME}${NC}"
    echo ""
    
    if echo "$REGISTRY_PASSWORD" | docker login "$REGISTRY_URL" -u "$REGISTRY_USERNAME" --password-stdin; then
        echo -e "${GREEN}✅ Login exitoso!${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}❌ Error al hacer login en el registry.${NC}"
        echo -e "${YELLOW}Verifica las credenciales y que tengas acceso al registry.${NC}"
        exit 1
    fi
}

# Función para verificar proyectos del registry
check_projects() {
    echo -e "${YELLOW}🔍 Verificando proyectos en el registry...${NC}"
    echo ""
    echo -e "Los siguientes proyectos deben existir en el registry:"
    echo -e "  ${BLUE}1.${NC} maturoscope-api"
    echo -e "  ${BLUE}2.${NC} maturoscope-app"
    echo -e "  ${BLUE}3.${NC} maturoscope-dashboard"
    echo ""
    echo -e "${YELLOW}⚠️  Nota: Los proyectos deben ser creados desde el panel de OVH.${NC}"
    echo -e "${YELLOW}    Si no existen, créalos antes de hacer push de imágenes.${NC}"
    echo ""
}

# Función para probar el push de una imagen de prueba
test_push() {
    echo -e "${YELLOW}🧪 ¿Deseas probar el push de una imagen de prueba? (y/n)${NC}"
    read -r response
    
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "${BLUE}Creando imagen de prueba...${NC}"
        
        # Crear un Dockerfile temporal
        cat > /tmp/test.Dockerfile << 'EOF'
FROM alpine:latest
RUN echo "Test image for Maturoscope Production Registry"
CMD ["echo", "Hello from Production Registry!"]
EOF
        
        # Construir la imagen
        docker build -t "${REGISTRY_URL}/maturoscope-api/test:latest" -f /tmp/test.Dockerfile /tmp/
        
        # Intentar hacer push
        echo -e "${BLUE}Haciendo push de la imagen de prueba...${NC}"
        if docker push "${REGISTRY_URL}/maturoscope-api/test:latest"; then
            echo -e "${GREEN}✅ Push exitoso! El registry está funcionando correctamente.${NC}"
            
            # Limpiar
            docker rmi "${REGISTRY_URL}/maturoscope-api/test:latest"
            rm /tmp/test.Dockerfile
        else
            echo -e "${RED}❌ Error al hacer push. Verifica que el proyecto 'maturoscope-api' exista.${NC}"
        fi
        echo ""
    fi
}

# Función para mostrar información de GitHub Secrets
show_github_secrets() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}   Configuración de GitHub Secrets   ${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "Debes configurar los siguientes secretos en GitHub:"
    echo ""
    echo -e "${GREEN}PROD_HARBOR_USERNAME${NC}"
    echo -e "  Valor: ${REGISTRY_USERNAME}"
    echo ""
    echo -e "${GREEN}PROD_HARBOR_PASSWORD${NC}"
    echo -e "  Valor: ${REGISTRY_PASSWORD}"
    echo ""
    echo -e "${YELLOW}Para configurar los secretos:${NC}"
    echo -e "1. Ve a tu repositorio en GitHub"
    echo -e "2. Settings > Secrets and variables > Actions"
    echo -e "3. Click 'New repository secret'"
    echo -e "4. Agrega cada secreto con su valor correspondiente"
    echo ""
}

# Función para verificar la estructura de proyectos
show_registry_structure() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}   Estructura del Registry   ${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${REGISTRY_URL}/"
    echo -e "├── ${GREEN}maturoscope-api/${NC}"
    echo -e "│   └── api:prod-{timestamp}-{sha}"
    echo -e "├── ${GREEN}maturoscope-app/${NC}"
    echo -e "│   └── app:prod-{timestamp}-{sha}"
    echo -e "└── ${GREEN}maturoscope-dashboard/${NC}"
    echo -e "    └── dashboard:prod-{timestamp}-{sha}"
    echo ""
}

# Menú principal
main_menu() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}   Menú Principal   ${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${GREEN}1.${NC} Verificar conexión al registry (login)"
    echo -e "${GREEN}2.${NC} Probar push de imagen de prueba"
    echo -e "${GREEN}3.${NC} Mostrar información de GitHub Secrets"
    echo -e "${GREEN}4.${NC} Mostrar estructura del registry"
    echo -e "${GREEN}5.${NC} Ejecutar todo (verificación completa)"
    echo -e "${GREEN}6.${NC} Salir"
    echo ""
    echo -e "${YELLOW}Selecciona una opción (1-6):${NC} "
    read -r option
    
    case $option in
        1)
            check_docker
            login_registry
            main_menu
            ;;
        2)
            check_docker
            login_registry
            test_push
            main_menu
            ;;
        3)
            show_github_secrets
            main_menu
            ;;
        4)
            show_registry_structure
            main_menu
            ;;
        5)
            check_docker
            login_registry
            check_projects
            test_push
            show_github_secrets
            show_registry_structure
            echo -e "${GREEN}✅ Verificación completa finalizada!${NC}"
            ;;
        6)
            echo -e "${BLUE}👋 Hasta luego!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Opción inválida. Por favor selecciona 1-6.${NC}"
            main_menu
            ;;
    esac
}

# Ejecutar el script
echo -e "${YELLOW}ℹ️  Registry URL: ${REGISTRY_URL}${NC}"
echo ""
main_menu
