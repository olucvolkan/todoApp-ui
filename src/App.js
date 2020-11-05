
import React, { useState, useEffect } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import _ from 'lodash';
import axios from 'axios';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';

function App() {

  const [result, setResult] = useState({});


  useEffect(() => {

    async function fetchData() {
      const result = await axios(
        process.env.REACT_APP_TODO_LIST_URL
      );
      setResult(result.data);
    } fetchData();
  }
    , []);

  const [text, setText] = useState("")

  const handleDragEnd = ({ destination, source }) => {
    if (!destination) {
      return;
    }

    if (destination.index === source.index && destination.droppableId === source.droppableId) {
      return;
    }

    const itemCopy = { ...result[source.droppableId].items[source.index] }
    setResult(prev => {
      prev = { ...prev }
      prev[source.droppableId].items.splice(source.index, 1)


      if (prev[destination.droppableId].items) {
        prev[destination.droppableId].items.splice(destination.index, 0, itemCopy)
      }
      return prev
    })

    var updateRequestPayload = {
      "id": parseInt(itemCopy.id),
      "status": destination.droppableId,
    }

    fetch(process.env.REACT_APP_TODO_UPDATE_URL, {
      method: 'POST',
      body: JSON.stringify(updateRequestPayload)
    })
  }


  const addItem = () => {

    var requestPayload = {
      "description": text,
      "status": "todo",
    }

    async function fetchData() {


      const response = await axios.post(
        process.env.REACT_APP_TODO_CREATE_URL, JSON.stringify(requestPayload)

      );
     
    
      let resultItems  = (result.todo.items !== null) ? result.todo.items  : [];

      setResult(function (result) {
          return {
            ...result,
            todo: {
              title: "todo",
              items: [
                {
                  id: response.data.id.toString(),
                  description: response.data.description
                },
                ...resultItems
              ]
            }
          };
        }
      );
    } fetchData();
    
    setText("")


  }

  const removeItem = (id, index, key) => {

    var requestPayload = {
      "id": parseInt(id)
    }

    fetch(process.env.REACT_APP_TODO_DELETE_URL, {
      method: 'POST',
      // We convert the React state to JSON and send it as the POST body
      body: JSON.stringify(requestPayload)
    }).then(function (response) {
      console.log(response)
    });

    setResult(result => {
      result = { ...result }
      result[key].items.splice(index, 1)

      return result
    })
  }
  return (
    <div className="App">
      <Container fluid>
        <Row className="justify-content-md-center">
          <Col sm={12}>
            <Form>
              <Form.Group controlId="exampleForm.ControlTextarea1">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={2} value={text} onChange={(e) => setText(e.target.value)} />

              </Form.Group>
            </Form>
          </Col>
          <Col sm={12} className={"justify-content-md-center"}>
            <Button onClick={addItem}>Add</Button>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <DragDropContext onDragEnd={handleDragEnd}>
            {_.map(result, (data, key) => {
              return (
                <div key={key} className={"column"}>
                  <h3>{data.title}</h3>
                  <Droppable droppableId={key}>
                    {(provided, snapshot) => {
                      return (
                        <div ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={
                            "droppable-col"
                          }
                        >
                          {data.items && data.items.map((el, index) => {
                            return (
                              <Draggable key={el.id} index={index} draggableId={el.id}>
                                {(provided, snapshot) => {
                                  return (
                                    <div
                                      className={`item ${snapshot.isDragging && "dragging"}`}
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      {el.description}
                                      <Button variant="danger" size="sm" className={"delete-button"} onClick={() => { removeItem(el.id, index, key) }} value={el.id}>Delete</Button>
                                    </div>
                                  )
                                }}
                              </Draggable>
                            )
                          })}
                          {provided.placeholder}
                        </div>
                      )
                    }}
                  </Droppable>
                </div>

              )
            }
            )}
          </DragDropContext>
        </Row>
      </Container>
    </div>

  );

}

export default App;
