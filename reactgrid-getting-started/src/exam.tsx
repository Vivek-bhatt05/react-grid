// import './App.css';
import { ReactGrid, Column, Row, CellChange, TextCell ,Id ,MenuOption,SelectionMode} from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";
import { useEffect, useState } from 'react';




//interface of Person
interface Person{
  id: number,
  name: string,
  email: string,
  phone: string,
}

// interface of Column of reordering
interface ColumnMap{
  name : "Name";
  email : "Email";
  phone : "Phone No.";
}

const columnMap: ColumnMap={
  name : "Name",
  email : "Email",
  phone : "Phone No."
}

type ColumnId = keyof ColumnMap;

//making of columns
const getColumns = (): Column[] => [
  { columnId: "name", width: 250, resizable:true, reorderable:true },
  { columnId: "email", width: 250, resizable:true, reorderable:true },
  { columnId: "phone", width: 250, resizable:true, reorderable:true },
];

// const headerRow: Row = {
//   rowId: "header",
//   cells: [
//     { type: "header", text: "Name" },
//     { type: "header", text: "Email" },
//     { type: "header", text: " Phone No." },
//     { type: "header", text: " Website" },
//   ]
// };


// new row making for reordering



const getRows = (people: Person[], columnsOrder: ColumnId[]): Row[] => {

  // console.log(columnMap,"test",columnsOrder)
  return [
    {
      rowId: "header",
      cells: [
        { type: "header", text: columnMap[columnsOrder[0]] },
        { type: "header", text: columnMap[columnsOrder[1]] },
        { type: "header", text: columnMap[columnsOrder[2]] },
      ]
    },
    ...people.map<Row>((person, i) => ({
      // rI: person.id,
      rowId: i,
      reorderable: true,
      cells: [
        { type: "text", text: person[columnsOrder[0]] },
        { type: "text", text: person[columnsOrder[1]] }, 
        { type: "text", text: person[columnsOrder[2]] }, 
      ]
    }))
  ]
};
 

//function for changes done in table
const appplyChanges=(
  changes:CellChange<TextCell>[],
  prevPeople:Person[]
):Person[]=>{
  changes.forEach((change)=>{

    console.log(changes)
    const personIndex= change.rowId;
    const fieldName= change.columnId;

    console.log(personIndex)
    console.log(fieldName)

    
    prevPeople[personIndex][fieldName]= change.newCell.text;
    console.log(prevPeople[personIndex][fieldName])
    console.log(change)
  });


  return [...prevPeople];
}


const reorderArray = <T extends {}>(arr: T[], idxs: number[], to: number) => {
  const movedElements = arr.filter((_, idx) => idxs.includes(idx));
  const targetIdx = Math.min(...idxs) < to ? to += 1 : to -= idxs.filter(idx => idx < to).length;
  const leftSide = arr.filter((_, idx) => idx < targetIdx && !idxs.includes(idx));
  const rightSide = arr.filter((_, idx) => idx >= targetIdx && !idxs.includes(idx));
  return [...leftSide, ...movedElements, ...rightSide];
}


function App() {

  //get data from api and store it into state variable people
  const getPeople = async():Promise<Person[]> =>{
    return fetch('http://localhost:8000/reg')
          .then(res => res.json())
          .then(res => {
                  console.log(res)
                  setPeople(res)
                  res.push({'name':'',email:'',phone:''})
                 
                  return res as Person[]
                  
          })
        };
 
  const [people,setPeople] = useState<Person[]>([]);
  const [columns, setColumns] = useState<Column[]>(getColumns());
   console.log(people)
  useEffect(()=>{
   getPeople()
  },[])

  // console.log(people)

  const rows= getRows(people,columns.map(c => c.columnId as ColumnId));
  // const columns= getColumns();


  const handleColumnsReorder = (targetColumnId: Id, columnIds: Id[]) => {
    //  console.log(targetColumnId)
    const to = columns.findIndex((column) => column.columnId === targetColumnId);
    // console.log(to);
    const columnIdxs = columnIds.map((columnId) => columns.findIndex((c) => c.columnId === columnId));
    setColumns(prevColumns => reorderArray(prevColumns, columnIdxs, to));
}

const handleRowsReorder = (targetRowId: Id, rowIds: Id[]) => {
    setPeople((prevPeople) => {
        const to = people.findIndex(person => person.id === targetRowId);
        const rowsIds = rowIds.map((id) => people.findIndex(person => person.id === id));
        return reorderArray(prevPeople, rowsIds, to);
    });
}

// const handleCanReorderRows = (targetRowId: Id, rowIds: Id[]): boolean => {
//   return targetRowId !== 'header';
// }

const handleContextMenu = (
  selectedRowIds: Id[],
  selectedColIds: Id[],
  selectionMode: SelectionMode,
  menuOptions: MenuOption[]
): MenuOption[] => {
  if (selectionMode === "row") {
    menuOptions = [
      ...menuOptions,
      {
        id: "removePerson",
        label: "Remove person",
        handler: () => {
          setPeople(prevPeople => {
            return [...prevPeople.filter((person, idx) => !selectedRowIds.includes(person.id))]
          })
        }
      }
    ];
  }
  return menuOptions;
}

  const handleChanges=(changes)=>{
    setPeople((prevPeople)=>appplyChanges(changes,prevPeople))
  }


  return (
    <div className="App">
      <ReactGrid
       rows={rows}
       columns={columns} 
       onCellsChanged={handleChanges}
      //  onColumnsReordered={handleColumnsReorder}
      //  onRowsReordered={handleRowsReorder}




      //  canReorderRows={handleCanReorderRows}

      //  stickyLeftColumns={1}
      //  stickyRightColumns={1}
		  //  stickyTopRows={1}
		  //  stickyBottomRows={1}

      onContextMenu={handleContextMenu}
      // enableRangeSelection
      // enableRowSelection
      // enableColumnSelection
      // enableFillHandle
      // enableGroupIdRender
       />
    </div>
  );
}

export default App;
