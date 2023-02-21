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
                        source: "th.jpg"  // the default image
                    },
                    new go.Binding("source", "source")),
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
let url = 'http://moosebackend-env.eba-3mkf2ukm.eu-central-1.elasticbeanstalk.com/getAll';
myHeaders.append("Authorization", "Basic bW9vc2U6bW9vc2UxOTkw");
var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

res = fetch(url, requestOptions)
.then(res => res.json())
.then(out => generateTree(out))


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

    fetch("http://moosebackend-env.eba-3mkf2ukm.eu-central-1.elasticbeanstalk.com/delete", requestOptions)
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

    fetch("http://moosebackend-env.eba-3mkf2ukm.eu-central-1.elasticbeanstalk.com/create", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));

    myDiagram.isModified = false;
}