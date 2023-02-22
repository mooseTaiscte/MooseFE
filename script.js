var $ = null
var myDiagram = null

function init(json) {
    $ = go.GraphObject.make;
    myDiagram =
    new go.Diagram("myDiagramDiv",
        { // enable Ctrl-Z to undo and Ctrl-Y to redo
            "undoManager.isEnabled": true,
            layout: new go.TreeLayout({ angle: 90, layerSpacing: 35, arrangement: go.TreeLayout.ArrangementHorizontal })
        });

    myDiagram.model = new go.TreeModel( json )

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
            $(go.Shape, "Rectangle",
                { name: "SHAPE", stroke: 'white', fill:"white", strokeWidth: 3.5, portId: "", width: 300 }),
            $(go.Panel, "Horizontal",
                $(go.Picture,
                    {
                        name: "Picture",
                        desiredSize: new go.Size(70, 70),
                        margin: 1.5,
                        source: "source.jpg"  // the default image
                    },
                    new go.Binding("source", "key", function(key) {
                        console.log("hey init");
                        // construct the picture source based on the node's key value
                        return key + ".jpg";
                      })),
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
                            editable: true,
                            isMultiline: false,
                            minSize: new go.Size(10, 25)
                        },
                        new go.Binding("text", "key").makeTwoWay()),
                    //NOME
                    $(go.TextBlock, "Title: ", "Nome:",
                        { row: 1, column: 0 }),
                    $(go.TextBlock, "Placeholder",
                        {
                            row: 1, column: 1, columnSpan: 4,
                            editable: true,
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
                            editable: true,
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
                            editable: true,
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
                            editable: true,
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
  


function generateTree(json){
    console.log(json) 
    init(json)
}

function addEmployee(node, ) {
    if (!node) return;
    const thisemp = node.data;
    myDiagram.startTransaction("add employee");
    const newemp = { name: "(new person)", title: "(title)", comments: "", parent: thisemp.key };
    myDiagram.model.addNodeData(newemp);
    const newnode = myDiagram.findNodeForData(newemp);
    if (newnode) newnode.location = node.location;
    myDiagram.commitTransaction("add employee");
    myDiagram.commandHandler.scrollToPart(newnode);
}

function deleteAll(){
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic bW9vc2U6bW9vc2UxOTkw");

    var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    redirect: 'follow'
    };

    fetch("https://moosebackend-env.eba-3mkf2ukm.eu-central-1.elasticbeanstalk.com/delete", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

function save() {
    
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic bW9vc2U6bW9vc2UxOTkw");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Cookie", "JSESSIONID=D03DBBB9D09EB831EFAEF0100A758F44");
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(JSON.parse(myDiagram.model.toJson())["nodeDataArray"]),
    };
    
    console.log(JSON.parse(myDiagram.model.toJson())["nodeDataArray"])
    deleteAll()

    fetch("https://moosebackend-env.eba-3mkf2ukm.eu-central-1.elasticbeanstalk.com/create", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));

    myDiagram.isModified = false;
}
// function to show the details for the clicked node
function showNodeDetails(e,node) {
    // create the side bar
    const sideBar = document.createElement('div');
    sideBar.setAttribute('id', 'sidebar');
    sideBar.style.cssText = 'position: absolute; top: 0; right: 0; bottom: 0; width: 300px; background: #f7f7f7; border-left: 1px solid #ddd; margin-left: 20px;';

    document.getElementById('myDiagramDiv').appendChild(sideBar);
    // create the content for the side bar
    const content = document.createElement('div');
    Object.assign(content.style, { padding: '20px' });
    sideBar.appendChild(content);
    
  
    // add the node details to the content
    const h2 = document.createElement('h2');
    h2.textContent = node.data.nome; // replace 'nome' with the name of the property you want to display
    content.appendChild(h2);
    
    const p1 = document.createElement('p');
    p1.textContent = "Instrumento: " +node.data.instrumento; // replace 'instrumento' with the name of the property you want to display
    content.appendChild(p1);
    
    const p2 = document.createElement('p');
    p2.textContent = "Naipe: "+node.data.naipe; // replace 'naipe' with the name of the property you want to display
    content.appendChild(p2);
    
    const p3 = document.createElement('p');
    p3.textContent = "Estágio: "+node.data.estagio; // replace 'estagio' with the name of the property you want to display
    content.appendChild(p3);

    const image = new Image();
    image.src = node.data.key+'.jpg';
    image.style.display = 'none';
    image.onload = function() {
        image.style.display = 'block';
        image.style.margin = '0 auto';
    };
    image.style.display = 'block';
    image.style.margin = '0 auto';
    image.style.width = '200px';
    content.prepend(image);
    
     // add a close button to the side bar
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.position = 'absolute';
  closeButton.style.bottom = '20px';
  closeButton.style.right = '20px';
  closeButton.style.zIndex='1000';
  sideBar.appendChild(closeButton);

  // add a click event handler to the close button
  closeButton.addEventListener('click', () => {
    sideBar.remove(); // remove the side bar from the DOM
  });
}