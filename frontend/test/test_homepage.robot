*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}    http://localhost:5173

*** Test Cases ***
Abrir página principal e fechar
    Open Browser    ${URL}    chrome
    Wait Until Page Contains    Luxus Brechó
    [Teardown]    Close Browser
