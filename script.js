var $ = null
var myDiagram = null
const sideBar = document.getElementById('sidebar');
const addButton = document.getElementById('add-button');
const content = document.getElementById('sidebar-content');
const dropdown = document.getElementById('select-field');

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
                { name: "BODY" },
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
                        new go.Binding("source", "key", function (key) {
                            return "https://moosepictures.s3.eu-central-1.amazonaws.com/" + key + ".jpg";
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
                        //ESTAGIO
                        $(go.TextBlock, "Title: ", "Estadio:",
                            { row: 4, column: 0 }),
                        $(go.TextBlock, "Placeholder",
                            {
                                row: 4, column: 1, columnSpan: 4,
                                isMultiline: false,
                                minSize: new go.Size(10, 14),
                                margin: new go.Margin(2, 0, 0, 3)
                            },
                            new go.Binding("text", "estagio").makeTwoWay()),
                    )
                )
            ),
            $("Button",
                $(go.Shape, "PlusLine", { width: 10, height: 10 }),
                {
                    name: "BUTTON", alignment: go.Spot.Right, opacity: 0,  // initially not visible
                    click: (e, button) => addEmployee(button.part)
                },
                // button is visible either when node is selected or on mouse-over
                new go.Binding("opacity", "isSelected", s => s ? 1 : 0).ofObject()
            ),
        );



    myDiagram.linkTemplate = new go.Link(
        // default routing is go.Link.Normal
        // default corner is 0
        { routing: go.Link.Orthogonal, corner: 5 })
        // the link path, a Shape
        .add(new go.Shape({ strokeWidth: 3, stroke: "#555" }))


}

let myHeaders = new Headers();
let url = 'https://www.moosebackendv2.eu-central-1.elasticbeanstalk.com/getAll';
myHeaders.append("Authorization", "Basic bW9vc2U6bW9vc2UxOTkw");
var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
};

let isFirstLoad = true;


function loadTree() {
    if (isFirstLoad) {
        console.log("hehehe");
        isFirstLoad = false;
        const cachedData = localStorage.getItem('treeData');
        if (cachedData) {
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
}


window.addEventListener("load", loadTree);



function generateTree(json) {
    console.log(json)
    init(json)
}

function addEmployee(node,) {
    if (!node) return;
    const thisemp = node.data;
    myDiagram.startTransaction("add employee");
    const newemp = {
        parent: thisemp.key,
        nome: "Placeholder", 
        alcunha: "Placeholder",
        instrumento: "Placeholder",
        estagio: "Placeholder",
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

function deleteAll() {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic bW9vc2U6bW9vc2UxOTkw");

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("https://www.moosebackendv2.eu-central-1.elasticbeanstalk.com/delete", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

function saveNodeToDB(node) {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic bW9vc2U6bW9vc2UxOTkw");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Cookie", "JSESSIONID=D03DBBB9D09EB831EFAEF0100A758F44");

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: "[" + JSON.stringify(node.data) + "]",
    };

    fetch("https://www.moosebackendv2.eu-central-1.elasticbeanstalk.com/create", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

    myDiagram.updateAllTargetBindings()
}


function showNodeDetails(e, node) {
    clearSibeBarContent()
    showSideBarPanel()
    addAlcunhaToSideBar(node.data.alcunha)
    addFieldsToSideBarDropdown()
    showAllNodeDetailOnSideBar(node)
    showTunanteImage(node.data.key)
    const save = document.getElementById('save')
    save.onclick = function(){saveNodeToDB(node)}
}

function showSideBarPanel(){
    sideBar.style.cssText = 'position: absolute; top: 0; right: 0; bottom: 0; width: 300px;';
    document.getElementById('myDiagramDiv').appendChild(sideBar);
    slideIn(sideBar, 300);
}

function closeSideBar(){
    slideOut(sideBar, 300)
}

function clearSibeBarContent(){
    content.innerHTML = "";
}

function showTunanteImage(key){
    const image = new Image();
    image.src = "https://moosepictures.s3.eu-central-1.amazonaws.com/" + key + ".jpg";
    image.style.display = 'none';
    image.onload = function () {
        image.style.display = 'block';
        image.style.margin = '0 auto';
    };
    image.style.display = 'block';
    image.style.margin = '0 auto';
    image.style.width = '200px';
    content.prepend(image);
}

function addAlcunhaToSideBar(alcunha){
    const h2 = document.createElement('h2');
    h2.textContent = alcunha;
    content.appendChild(h2);
}

function showAllNodeDetailOnSideBar(node){
    Object.keys(node.data).forEach(key => {    
        if (key !== 'key' && key !== '__gohashid' && key !== 'id' && key !== 'alcunha' && key !== 'parent' && node.data[key] && node.data[key].length !== 0) {
            const p = document.createElement('p');
            const keyText = key.charAt(0).toUpperCase() + key.slice(1);
            const valueText = node.data[key];
            if (key == 'padrinhoName' && node.data.gender == "F") {
                p.textContent = `Padrinho: ${node.data[key]}`;
            } 
            else if (key == 'padrinhoName' && node.data.gender == "M") { 
                p.textContent = `Madrinha: ${node.data[key]}`;
            } 
            else {
                p.textContent = `${keyText}: `;
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = 'Value';
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

function addFieldsToSideBarDropdown(){
    dropdown.innerHTML = `
        <option value="">Novo Campo</option>
        <option value="localTuno">Local Tuno</option>
        <option value="localSaida">Local Cota</option>
        <option value="dataTuno">Data Tuno</option>
        <option value="dataCota">Data Cota</option>
    `;
}

function addSelectedFieldToSideBar() {
    const selectedKey = dropdown.value;
    if (selectedKey) {
        const p = document.createElement('p');
        const keyText = selectedKey.charAt(0).toUpperCase() + selectedKey.slice(1);
        p.textContent = `${keyText}: `;
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Value';
        input.value = '';
        input.addEventListener('input', () => {
            node.data[selectedKey] = input.value;
        });
        p.appendChild(input);
        content.appendChild(p);
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

