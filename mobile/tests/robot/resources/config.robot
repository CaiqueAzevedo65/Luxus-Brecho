*** Variables ***
# Appium Configuration
${REMOTE_URL}           http://localhost:4723/wd/hub
${PLATFORM_NAME}        Android
${DEVICE_NAME}          Android Emulator
${APP_PACKAGE}          host.exp.exponent
${APP_ACTIVITY}         host.exp.exponent.experience.HomeActivity
${AUTOMATION_NAME}      UiAutomator2
${WAIT_TIMEOUT}         15

# Test Data
${VALID_EMAIL}          teste@luxusbrecho.com
${VALID_PASSWORD}       senha123
${INVALID_EMAIL}        email-invalido
${INVALID_PASSWORD}     123
