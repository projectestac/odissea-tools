## Odissea Tools
Automatització d'operacions a Odissea

#### Instal·lació
Per a utilitzar les utilitats cal haver instal·lat abans [Node.js](https://nodejs.org/en/) versió 16 o superior.

Per inicialitzar l'aplicació cal carregar els components NPM des de l'arrel del projecte, amb l'ordre:

```bash
$ npm ci
```

Tot seguit cal generar els fitxers `session.json` i `tasks.json`. Es pot fer a partir de les còpies que es proporcionen:

```bash
$ cp session-example.json session.json
$ cp tasks-example.json tasks.json
```

### Inicialització de la sessió
Aquesta aplicació funciona fent crides a Odissea des d'un navegador web en segon pla. Per tal que funcioni, cal proporcionar-li un codi de sessió vàlid, iniciada per un usuari amb drets d'accés a la informació que es vol descarregar, i l'identificador del navegador utilitzat per a iniciar la sessió.

Els passos a seguir són:

- Inicieu sessió a Odissea amb el vostre navegador web
- Obriu les eines de desenvolupador del navegador amb la combinació de tecles [Ctrl]+[Maj]+I
- Seleccioneu la pestanya `Network` (o `Xarxa`, segins en quin idioma tingueu les eines de desenvolupament)
- Recarregueu la pàgina web que estigueu visualitzant
- Seleccioneu la primera entrada, corresponent a la pàgina d'Odissea on us trobeu
- Busqueu a les capçaleres el valor de `cookie` i copieu-lo
- Enganxeu aquest valor al camp `cookie` del fitxer `session.php`
- Feu el mateix amb la capçalera HTTP `user-agent`. Aquesta s'ha d'enganxar al camp `userAgent` de `session.php`

El valor de `cookie` s'ha d'anar actualitzant a cada sessió. El de `user-agent` només quan s'actualitza el navegador, o quan vulgueu fer servir un ordinador diferent.

### Preparació de les dades a recollir
Actualment l'aplicació implementa només una tasca: descarregar els informes dels cursos indicats i guardar-los en format PDF. Aquesta tasca es configura al camp `exportPDF` del fitxer `tasks.json`.

Ompliu el fitxer `tasks.json` amb els valors de nom curt i identificador numèric de cada curs per al qual vulgueu descarregar l'informe.

També podeu ajustar altres paràmetres. Els valors `mode`, `report` i `time` corresponen als camps de formulari a partir dels quals Moodle genera els informes.

### Descàrrega de dades
Engegant el fitxer `index.js` s'aniran descarregant tots els fitxers, que portaran el nom del curs i es guardaran al directori indicat (per defecte: `informes`). 
