*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}    http://localhost:5173/sobre

*** Test Cases ***
Abrir página Sobre Nós e verificar título
    Open Browser    ${URL}    chrome
    Wait Until Page Contains    Sobre Nós
    [Teardown]    Close Browser
