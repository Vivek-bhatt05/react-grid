// import './App.css';
import { ReactGrid, Column, Row, CellChange, TextCell} from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";
import { useEffect, useState } from 'react';
import axios from "axios"



interface MyTextCell extends TextCell {
  dataId:string
}


//interface of Person
interface Person{
  _id: string,
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

  return [
    {
      rowId: "header",
      cells: [
        { type: "header", text: columnMap[columnsOrder[0]] },
        { type: "header", text: columnMap[columnsOrder[1]], },
        { type: "header", text: columnMap[columnsOrder[2]] },
      ]
    },
    ...people.map<Row>((person, i) => ({
      // rI: person.id,
      rowId: i,
      reorderable: true,
      cells: [
        { type: "text", text: person[columnsOrder[0]],dataId:person._id },
        { type: "email", text: person[columnsOrder[1]], dataId:person._id , validator : ((text: string) => true )}, 
        { type: "text", text: person[columnsOrder[2]], dataId:person._id }, 
      ]
    }))
  ]
};
 




function App() {

  


  //get data from api and store it into state variable people
  const getPeople = async():Promise<Person[]> =>{
    return fetch('http://localhost:8000/reg')
          .then(res => res.json())
          .then(res => {
                  // console.log(res)
                  setPeople(res)
                  let empObj={name:'',email:'',phone:''}

                  res.push(empObj)
                 
                  return res as Person[]
                  
          })
        };
 
  const [people,setPeople] = useState<Person[]>([]);
  const [columns] = useState<Column[]>(getColumns());
  //  console.log(people)




//function for changes done in table
const appplyChanges=(
  changes:CellChange<MyTextCell>[],
  prevPeople:Person[]
):Person[]=>{
  changes.forEach((change)=>{

  
    console.log(changes)
    const personIndex= change.rowId;
    const fieldName= change.columnId;

    // console.log(personIndex)
    // console.log(fieldName)

    
    prevPeople[personIndex][fieldName]= change.newCell.text;
    // console.log(prevPeople[personIndex],"prevPeopleprevPeople")
    
    // console.log(prevPeople[personIndex][fieldName])
    // console.log(change)
    makePost(prevPeople[personIndex])
  });




  // if(empObj.name!=="" || empObj.email!=="" || empObj.phone !==""){
  //   makePost(empObj)
  // }


  return [...prevPeople];
}

const makePost=(payload)=>{

  
  console.log(payload,payload._id,"payloadpayloadpayload")
  if (payload._id){
    axios.patch(`http://localhost:8000/reg/${payload._id}/`,payload,)
    .then((res) =>{
      console.log(res);
      getPeople()
    })
    .catch( (error) =>{
      console.log(error);
    });  
  }
  else{
    axios.post('http://localhost:8000/reg',payload,)
    .then((res) =>{
      console.log(res);
      getPeople()
    })
    .catch( (error) =>{
      console.log(error);
    });
  }
  
}


  useEffect(()=>{
   getPeople()
  },[])

  // console.log(people)

  const rows= getRows(people,columns.map(c => c.columnId as ColumnId));
  // const columns= getColumns();






  const handleChanges=(changes)=>{
    setPeople((prevPeople)=>appplyChanges(changes,prevPeople))
  }


  return (
    <div className="App">
      <ReactGrid
       rows={rows}
       columns={columns} 
       onCellsChanged={handleChanges}
       enableFillHandle={true}

       />
    </div>
  );
}

export default App;
