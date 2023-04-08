var $ = null
var myDiagram = null
var editable = false
const sideBar = document.getElementById('sidebar');
const addButton = document.getElementById('add-button');
const content = document.getElementById('sidebar-content');
const dropdown = document.getElementById('select-field');
const sideBarValues = new Map([
    ["localTuno", "Local de Passagem a Tuno"],
    ["dataTuno", "Data da Passagem a Tuno"],
    ["localCaloiro", "Local de Subida a Palco"],
    ["dataCaloiro", "Data da Subida a Palco"],
    ["dataSaida", "Data da Saída da Tuna"],
    ["localSaída", "Local da Saída da Tuna"],
    ["instrumento", "Instrumento"],
    ["curso", "Curso"],
    ["gender", "Género"],
    ["hierarquia", "Hierarquia"],
    ["naipe", "Naipe"],
    ["padrinhoName", "Padrinho"],
    ["nome", "Nome"],
    ["dataIngressao", "Data de Entrada"],
    ["familia", "Familia"],
    ["alcunha", "Alcunha"],

]);
const instrumentoList = new Set();
const naipeList = new Set();
const hierarquiaList = new Set();
const familiaList = new Set();
const cursoList = new Set();

function init(json) {
    $ = go.GraphObject.make;
    myDiagram =
        new go.Diagram("myDiagramDiv",
            { // enable Ctrl-Z to undo and Ctrl-Y to redo
                "undoManager.isEnabled": true,
                layout: new go.TreeLayout({ angle: 90, layerSpacing: 35, arrangement: go.TreeLayout.ArrangementHorizontal })
            });

    myDiagram.model = new go.TreeModel(json)

    // define a simple Node template
    myDiagram.nodeTemplate =
        $(go.Node, "Spot",
            {
                selectionObjectName: "BODY",
                mouseEnter: (e, node) => node.findObject("BUTTON").opacity = 1,
                mouseLeave: (e, node) => node.findObject("BUTTON").opacity = 0,
                click: showNodeDetails // add a click event handler to the node
            },
            $(go.Panel, "Auto",
                $(go.Shape, "Border",
                    { name: "SHAPE", stroke: 'white', fill: "white", strokeWidth: 3.5, portId: "", width: 300 }),
                $(go.Panel, "Horizontal",
                    $(go.Picture,
                        {
                            name: "Picture",
                            desiredSize: new go.Size(70, 70),
                            margin: 1.5,
                            source: "source.jpg",  // the default image
                            imageStretch: go.GraphObject.UniformToFill
                            //go.GraphObject.Uniform also usable
                        },
                        new go.Binding("source", "", function (data) {
                            if (data.hasImage) {
                                //return "https://moosepicturesbucket.s3.eu-central-1.amazonaws.com/" + data.key + ".jpg";
                            }
                        })

                    ),
                    $(go.Panel, "Table",
                        {
                            minSize: new go.Size(200, NaN),
                            margin: new go.Margin(6, 10, 0, 6),
                            defaultAlignment: go.Spot.Left
                        },
                        $(go.RowColumnDefinition, { column: 2, width: 2 }),
                        //ALCUNHA
                        $(go.TextBlock, "Placeholder",  // the name
                            {
                                row: 0, column: 0, columnSpan: 5,
                                textAlign: "center",
                                font: "14pt Segoe UI,sans-serif",
                                isMultiline: false,
                                minSize: new go.Size(10, 25)
                            },
                            new go.Binding("text", "alcunha").makeTwoWay()),
                        //NOME
                        $(go.TextBlock, "Title: ", "Nome:",
                            { row: 1, column: 0 }),
                        $(go.TextBlock, "Placeholder",
                            {
                                row: 1, column: 1, columnSpan: 4,
                                isMultiline: false,
                                minSize: new go.Size(10, 14),
                                margin: new go.Margin(2, 0, 0, 3)
                            },
                            new go.Binding("text", "nome").makeTwoWay()),
                        //INSTRUMENTO
                        $(go.TextBlock, "Title: ", "Instrumento:",
                            { row: 2, column: 0 }),
                        $(go.TextBlock, "Placeholder",
                            {
                                row: 2, column: 1, columnSpan: 4,
                                isMultiline: false,
                                minSize: new go.Size(10, 14),
                                margin: new go.Margin(2, 0, 0, 3)
                            },
                            new go.Binding("text", "instrumento").makeTwoWay()),
                        //NAIPE
                        $(go.TextBlock, "Title: ", "Naipe:",
                            { row: 3, column: 0 }),
                        $(go.TextBlock, "Placeholder",
                            {
                                row: 3, column: 1, columnSpan: 4,
                                isMultiline: false,
                                minSize: new go.Size(10, 14),
                                margin: new go.Margin(2, 0, 0, 3)
                            },
                            new go.Binding("text", "naipe").makeTwoWay()),
                        //Hierarquia
                        $(go.TextBlock, "Title: ", "Hierarquia:",
                            { row: 4, column: 0 }),
                        $(go.TextBlock, "Placeholder",
                            {
                                row: 4, column: 1, columnSpan: 4,
                                isMultiline: false,
                                minSize: new go.Size(10, 14),
                                margin: new go.Margin(2, 0, 0, 3),
                                name: "hierarquia"
                            },
                            new go.Binding("text", "", function (data) {
                                if (data.gender == "F") {
                                    if (data.hierarquia == "Caloiro") {
                                        return "Caloira";
                                    }
                                    if (data.hierarquia == "Veterano") {
                                        return "Veterana";
                                    }
                                }
                                return data.hierarquia;

                            }).makeTwoWay()),
                    )
                )
            ),
            $("Button",
                $(go.Shape, "PlusLine", { width: 10, height: 10 }),
                {
                    name: "BUTTON", alignment: go.Spot.Right, opacity: 0,  // initially not visible
                    click: (e, button) => addTunante(button.part),

                },
            ),
            $("Button",
                $(go.Shape, "MinusLine", { width: 10, height: 10 }),
                {
                    name: "BUTTON2", alignment: go.Spot.Left, opacity: 0,  // initially not visible
                    click: (e, button) => removeTunante(button.part)
                },
                // button is visible either when node is selected or on mouse-over

            ),
            {
                name: "BODY",
                mouseEnter: function(e, node) {
                    node.findObject("BUTTON").opacity = 1;
                    node.findObject("BUTTON2").opacity = 1;
                },
                mouseLeave: function(e, node) {
                    node.findObject("BUTTON").opacity = 0;
                    node.findObject("BUTTON2").opacity = 0;
                }
            },
        );

    myDiagram.linkTemplate = new go.Link(
        // default routing is go.Link.Normal
        // default corner is 0
        { routing: go.Link.Orthogonal, corner: 5 })
        // the link path, a Shape
        .add(new go.Shape({ strokeWidth: 3, stroke: "#555" }))
    setNodeBorderByFamilia()

    //Populate list
    createDropdownValues(instrumentoList,'instrumento');
    createDropdownValues(familiaList,'familia');
    createDropdownValues(hierarquiaList,'hierarquia');
    createDropdownValues(naipeList,'naipe');
    createDropdownValues(cursoList,'curso');
    //Create Top bar Values
    createTopBarValues();
}

let myHeaders = new Headers();
let url = 'https://moose.eu-central-1.elasticbeanstalk.com/getAll';
myHeaders.append("Authorization", "Basic bW9vc2U6bW9vc2UxOTkw");
var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
};

function createTopBarValues() {
    
    selectElement = document.getElementById("alcunha-input").value = '';;

    populateTopBarValues('instrumento-input', 'instrumento', instrumentoList);
    populateTopBarValues('familia-input', 'familia', familiaList);
    populateTopBarValues('hierarquia-input', 'hierarquia', hierarquiaList);
    populateTopBarValues('naipe-input', 'naipe', naipeList);
    populateTopBarValues('curso-input', 'curso', cursoList);

}
function createDropdownValues(listToPopulate, propertyName) {

    // Loop through the nodes and add their property values to the Set
    myDiagram.nodes.each(function (node) {
        if (node.data[propertyName] != null) {
            listToPopulate.add(node.data[propertyName]);
        }
    });
}

function populateTopBarValues(selectId, propertyName,valuesList) {
    // Get the select element
    const select = document.getElementById(selectId);

      // Add the default option to the select element
      const defaultOption = document.createElement('option');
      defaultOption.text = propertyName[0].toUpperCase() + propertyName.slice(1); // capitalize the first letter of the property name
      defaultOption.selected = true;
      select.add(defaultOption);

    // Create the dropdown options based on the values in the Set
    valuesList.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.text = value;
            select.add(option);
        
    });
}

function loadTree(forceLoad) {

    const cachedData = localStorage.getItem('treeData');
    if (forceLoad) {
        myDiagram.div = null;
    }
    if (cachedData && !forceLoad) {
        generateTree(JSON.parse(cachedData));
    } else {
        fetch(url, requestOptions)
            .then(res => res.json())
            .then(data => {
                localStorage.setItem('treeData', JSON.stringify(data));
                generateTree(data);
            });
    }

}

window.addEventListener("load", loadTree(false));

function generateTree(json) {
    console.log(json)
    init(json)
}

// Set colors to Tunantes by family value
function setNodeBorderByFamilia() {
    myDiagram.nodes.each(function (node) {
        const familia = node.data.familia;
        let color = "black";
        switch (familia) {
            case "Almeida":
                color = "pink";
                break;
            case "Bastos":
                color = "darkblue";
                break;
            case "Gomes":
                color = "mediumpurple";
                break;
            case "Ramos":
                color = "green";
                break;
            case "Lopes":
                color = "lime";
                break;
        }
        node.findObject("SHAPE").stroke = color;
        node.findObject("SHAPE").fill = "white";
    })
}

// Triggered by the top bar Filtrar Button
function filter() {
    setNodeBorderByFamilia()
    const instrumento = document.getElementById('instrumento-input').value;
    const familia = document.getElementById('familia-input').value;
    const naipe = document.getElementById('naipe-input').value;
    const curso = document.getElementById('curso-input').value;
    const hierarquia = document.getElementById('hierarquia-input').value;
    var alcunha = document.getElementById('alcunha-input').value;

    let nodeData = {};
    if (instrumento !== "" && instrumento !== "Instrumento") {
        nodeData.instrumento = capitalizeFirstLetter(instrumento);
    }
    if (familia !== "" && familia !== "Familia") {
        nodeData.familia = capitalizeFirstLetter(familia);
    }
    if (naipe !== "" && naipe !== "Naipe") {
        nodeData.naipe = capitalizeFirstLetter(naipe);
    }
    if (curso !== "" && curso !== "Curso") {
        nodeData.curso = capitalizeFirstLetter(curso);
    }
    if (hierarquia !== "" && hierarquia !== "Hierarquia") {
        nodeData.hierarquia = capitalizeFirstLetter(hierarquia);
    }

    //if the alcunha field is filled, and that alcunha belongs to someone add it to the search in its normalized form
    if (alcunha !== "" && alcunha !== "Alcunha") {
        var found = false;
        myDiagram.nodes.each(function (node) {
            if (normalizeAndReplaceAccentedChars(alcunha.toLowerCase()) === normalizeAndReplaceAccentedChars(node.data.alcunha.toLowerCase())) {
                nodeData.alcunha = capitalizeFirstLetter(node.data.alcunha);
                found = true;
            }
        });
        if (!found) {
            var warning = document.createElement('div');
            warning.textContent = "Não existe ninguém com essa alcunha";
            document.getElementById('warnings').appendChild(warning);
            setTimeout(function () {
                document.getElementById('warnings').removeChild(warning);
            }, 2000);
        }
    }

    var findNodes = myDiagram.findNodesByExample(nodeData);

    if (Object.keys(nodeData).length !== 0) {
        findNodes.each(node => {
            node.findObject("SHAPE").stroke = "#006699";
            node.findObject("SHAPE").fill = "#5CE1E6";
            if (findNodes.count == 1) {
                myDiagram.centerRect(node.actualBounds);
            }
        });
    }

}

function normalizeAndReplaceAccentedChars(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "");
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function addTunante(node) {
    if (!node) return;
    const thisemp = node.data;
    myDiagram.startTransaction("add employee");
    const newemp = {
        parent: thisemp.key,
        nome: "Placeholder",
        alcunha: "Placeholder",
        instrumento: "Placeholder",
        hierarquia: "Placeholder",
        naipe: "Placeholder",
        curso: "Placeholder",
        localCaloiro: "Placeholder",
        localSaida: "Placeholder",
        dataCaloiro: "1970-01-01",
        dataNascimento: "1970-01-01",
        dataIngressao: "1970-01-01",
    };
    myDiagram.model.addNodeData(newemp);
    const newnode = myDiagram.findNodeForData(newemp);
    if (newnode) newnode.location = node.location;
    myDiagram.commitTransaction("add employee");
    myDiagram.commandHandler.scrollToPart(newnode);
}

function removeTunante(node) {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic bW9vc2U6bW9vc2UxOTkw");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Cookie", "JSESSIONID=D03DBBB9D09EB831EFAEF0100A758F44");

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
    };
    
    fetch("https://moose.eu-central-1.elasticbeanstalk.com/delete?id=" + node.key, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

    myDiagram.updateAllTargetBindings()

    loadTree(true);
}

//Not in use
function deleteAll() {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic bW9vc2U6bW9vc2UxOTkw");

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("https://moose.eu-central-1.elasticbeanstalk.com/delete", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

function saveNodeToDB(node) {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic bW9vc2U6bW9vc2UxOTkw");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Cookie", "JSESSIONID=D03DBBB9D09EB831EFAEF0100A758F44");

    data = removeKeyIfNegative(node.data)

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: "[" + JSON.stringify(data) + "]",
    };

    fetch("https://moose.eu-central-1.elasticbeanstalk.com/save", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

    myDiagram.updateAllTargetBindings()
}

function removeKeyIfNegative(node){
    if (node.key < 0){
        var newData = {};
        for (var prop in node) {
            if (prop !== "key") {
                newData[prop] = node[prop];
            }
        }
        return newData
    }
    return node
}


function showNodeDetails(e, node) {
    clearSibeBarContent()
    showSideBarPanel()
    addAlcunhaToSideBar(node.data.alcunha)
    addFieldsToSideBarDropdown(node)
    if (editable){
        showAllNodeDetailOnSideBarEditable(node)
    } else {
        showAllNodeDetailOnSideBar(node)
    }
    //showTunanteImage(node.data.key)
    //showTunanteImage(node)
    const save = document.getElementById('save')
    save.onclick = function () { saveNodeToDB(node) }
    const add = document.getElementById("add-button")
    add.onclick = function () { addSelectedFieldToSideBar(node) }
}

function showSideBarPanel() {
    sideBar.style.cssText = 'position: absolute; top: 0; right: 0; bottom: 0; width: 300px;';
    document.getElementById('myDiagramDiv').appendChild(sideBar);
    slideIn(sideBar, 300);
}

function closeSideBar() {
    slideOut(sideBar, 300)
}

function clearSibeBarContent() {
    content.innerHTML = "";
}

function showTunanteImage(node) {
    const existingImage = document.querySelector(`img[data-key="${node.data.key}"]`);
    if (existingImage) {
      existingImage.src = `https://moosepicturesbucket.s3.eu-central-1.amazonaws.com/${node.data.key}.jpg?${Date.now()}`;
    } else {
      const image = new Image();
      image.src = `https://moosepicturesbucket.s3.eu-central-1.amazonaws.com/${node.data.key}.jpg`;
      image.style.display = 'none';
      image.onload = function() {
        image.style.display = 'block';
        image.style.margin = '0 auto';
      };
      image.style.display = 'block';
      image.style.margin = '0 auto';
      image.style.width = '200px';
      image.setAttribute('data-key', node.data.key);
      image.addEventListener('click', function() {
        uploadImage(image,node);
      });
      content.prepend(image);
    }
  }
  

function uploadImage(image,node) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function (event) {
      const file = event.target.files[0];
      AWS.config.update({
        region: 'eu-central-1',
        credentials: new AWS.Credentials({
          accessKeyId: '-',
          secretAccessKey: '-/-'
        })
      });
      const s3 = new AWS.S3();

      const params = {
        Bucket: 'moosepicturesbucket',
        Key: node.data.key+".jpg",
        ContentType: ".jpg",
        Body: file,
        ACL: 'public-read',
      };
    
    };
    image.removeEventListener('click', uploadImage);
    input.click();
  }

function addAlcunhaToSideBar(alcunha) {
    const h2 = document.createElement('h2');
    h2.textContent = alcunha;
    content.appendChild(h2);
}

function showAllNodeDetailOnSideBar(node) {
    editable.hidden = true
    save.hidden = true
    Object.keys(node.data).forEach(key => {
        if (sideBarValues.has(key)&& node.data[key] && node.data[key].length !== 0) {
            const p = document.createElement('p');
            const tag = sideBarValues.get(key);
            if (key == 'padrinhoName' && node.data.gender == "F") {
                p.textContent = `Padrinho: ${node.data[key]}`;
            }
            else if (key == 'padrinhoName' && node.data.gender == "M") {
                p.textContent = `Madrinha: ${node.data[key]}`;
            }
            else {
                p.textContent = `${tag}: ${node.data[key]}`;
            }
            content.appendChild(p);
        }
    });
}

function showAllNodeDetailOnSideBarEditable(node) {
    editable = document.getElementById("editable-inputs")
    editable.hidden = false
    save.hidden = false
    console.log(node.data)
    Object.keys(node.data).forEach(key => {
        if (sideBarValues.has(key)&& node.data[key] && node.data[key].length !== 0) {
            const p = document.createElement('p');
            const tag = sideBarValues.get(key);
            p.textContent = `${tag}: `;
            const keyText = key.charAt(0).toUpperCase() + key.slice(1);
            const valueText = node.data[key];
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Value';
            if (key == 'padrinhoName' && node.data.gender == "F") {
                p.textContent = `Padrinho: ${node.data[key]}`;
            }
            else if (key == 'padrinhoName' && node.data.gender == "M") {
                p.textContent = `Madrinha: ${node.data[key]}`;
            }
            else if (key == 'hierarquia' && node.data.gender == "F") {
                if (node.data[key] == "Caloiro") {
                    input.value = "Caloira"
                }
                if (node.data[key] == "Veterano") {
                    input.value = "Veterana"
                }
                else {
                    input.value = node.data[key]
                }
                input.addEventListener('input', () => {
                    node.data[key] = input.value;
                });
                p.appendChild(input);
            }
            else {
                input.value = valueText;
                input.addEventListener('input', () => {
                    node.data[key] = input.value;
                });
                p.appendChild(input);
            }
            content.appendChild(p);
        }
    });
}

function addFieldsToSideBarDropdown(node) {

    dropdown.innerHTML = "";

    const existingValues = new Set(Object.keys(node.data).filter(key => node.data[key] !== null && node.data[key] !== ""));
    for (const [value, text] of sideBarValues) {
        if (!existingValues.has(value) && ((node.data[value] === "" || node.data[value] === null))) {
            const option = document.createElement("option");
            option.value = value;
            option.text = text;
            dropdown.appendChild(option);
            existingValues.add(value);
        }
    }
}

function addSelectedFieldToSideBar(node) {

    const selectedOption = dropdown.options[dropdown.selectedIndex];
    const selectedKey = selectedOption.text;
    const selectedValue = selectedOption.value;
    if (selectedKey) {
        const p = document.createElement('p');
        const keyText = selectedKey.charAt(0).toUpperCase() + selectedKey.slice(1);
        p.textContent = `${keyText}: `;
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Value';
        input.value = '';
        input.addEventListener('input', () => {
            node.data[selectedValue] = input.value;
        });
        p.appendChild(input);
        content.appendChild(p);
        dropdown.removeChild(selectedOption);
    }
};

function slideIn(element, duration) {
    element.style.visibility = "visible";
    element.style.transition = "width " + duration + "ms ease-in-out";
    element.style.width = "0px";
    setTimeout(() => {
        element.style.width = "300px";
    }, 10);
}

function slideOut(element, duration) {
    element.style.transition = "width " + duration + "ms ease-in-out";
    element.style.width = "0px";
    setTimeout(() => {
        element.style.visibility = "hidden";
    }, duration);
}

function loginEditMode() {
    let pass = prompt("Qual é a password chavalo?", "");
    if (checkPassword(pass)){
        enableEditMode()
        closeSideBar()
    }
}

function checkPassword(pass){
    return true
}

function enableEditMode(){
    editable = true
}