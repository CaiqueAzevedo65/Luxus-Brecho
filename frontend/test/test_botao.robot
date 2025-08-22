*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}    http://localhost:5173/

*** Test Cases ***
Validar Link "Sobre Nós"
    Open Browser    ${URL}    chrome
    Wait Until Element Is Visible    xpath=//a[contains(text(), 'Sobre Nós')]    timeout=10s
    Element Should Be Enabled        xpath=//a[contains(text(), 'Sobre Nós')]
    Click Element                    xpath=//a[contains(text(), 'Sobre Nós')]
    Wait Until Element Is Visible    xpath=//h1[contains(text(), 'Nossa Missão')]    timeout=10s
    Wait Until Page Contains         Nossa História   timeout=10s
    Wait Until Page Contains         Nossos Valores  timeout=10s
    [Teardown]    Close Browser
