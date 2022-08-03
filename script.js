var $ = null
var myDiagram = null

function init(json) {
    $ = go.GraphObject.make;
    myDiagram =
    new go.Diagram("myDiagramDiv",
        { // enable Ctrl-Z to undo and Ctrl-Y to redo
            "undoManager.isEnabled": true,
            layout: new go.TreeLayout({ angle: 90, layerSpacing: 35 })
        });

    myDiagram.model = new go.TreeModel( json )

    // define a simple Node template
    myDiagram.nodeTemplate =
    $(go.Node, "Auto",
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
        
    );

    myDiagram.linkTemplate = new go.Link(
        // default routing is go.Link.Normal
        // default corner is 0
        { routing: go.Link.Orthogonal, corner: 5 })
        // the link path, a Shape
        .add(new go.Shape({ strokeWidth: 3, stroke: "#555" }))

    
}

let headers = new Headers();
let url = 'https://cryptic-shelf-15906.herokuapp.com/getAll';

res = fetch(url)
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