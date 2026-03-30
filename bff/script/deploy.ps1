# Configuración
$remoteUser = "root"
$remoteHost = "187.33.144.120"
$remoteDir = "/sqlbloques"
$sshKey = "C:\Users\prueb\.ssh\id_ed25519"
$appEntryPoint = "dist/app.js"

# 1. Compilar backend
Write-Host "==== Compilando backend ===="
npm run build

# 2. Detener todos los procesos Node.js remotamente
Write-Host "==== Matando procesos de Node.js en servidor remoto ===="
ssh -i $sshKey "${remoteUser}@${remoteHost}" "pkill -f node || true"

# 3. Copiar archivos sueltos
Write-Host "==== Copiando archivos esenciales ===="
scp -i $sshKey package.json package-lock.json .env "${remoteUser}@${remoteHost}:${remoteDir}/"

# 4. Copiar carpeta dist sin incluir database.sqlite si estuviera allí
Write-Host "==== Copiando carpeta dist al servidor remoto ===="
# Usamos tar para excluir database.sqlite si accidentalmente está allí
scp -i $sshKey -r $(Get-ChildItem -Path dist -Recurse | Where-Object { $_.Name -ne '' }).FullName "${remoteUser}@${remoteHost}:${remoteDir}/dist/"

# 5. Instalar dependencias y lanzar app en segundo plano
Write-Host "==== Instalando dependencias y lanzando app ===="
ssh -i $sshKey "${remoteUser}@${remoteHost}" "cd $remoteDir/dist && npm install --omit=dev && nohup node app.js > nohup.out 2>&1 &"
