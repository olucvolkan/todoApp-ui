
import React, { useState, useEffect } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import _ from 'lodash';
import axios from 'axios';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';
import { v4 } from "uuid";

function App() {

  const [result, setResult] = useState({});


  useEffect(() => {
    
    async function fetchData() {
      const result = await axios(
        process.env.REACT_APP_TODO_LIST_URL,
      );
      setResult(result.data);
    } fetchData();
  }
    , []);

  const [text, setText] = useState("")

  const handleDragEnd = ({ destination, source }) => {
    console.log(destination);
    console.log(source);
    if (!destination) {
      return;
    }

    if (destination.index === source.index && destination.droppableId === source.droppableId) {

      return;
    }

    const itemCopy = { ...result[source.droppableId].items[source.index] }
    setResult(prev => {
      console.log(itemCopy)
      console.log(prev)
      prev = { ...prev }
      prev[source.droppableId].items.splice(source.index, 1)

      prev[destination.droppableId].items.splice(destination.index, 0, itemCopy)

      return prev
    })

    var updateRequestPayload = {
      "id": parseInt(itemCopy.id),
      "status": destination.droppableId,
    }
    console.log(updateRequestPayload)

    fetch(process.env.REACT_APP_TODO_UPDATE_URL, {
      method: 'POST',
      body: JSON.stringify(updateRequestPayload),
      mode: 'no-cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'include', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  }


  const addItem = () => {
    // Api implementation     

    setResult(prev => {
      return {
        ...prev,
        todo: {
          title: "title",
          items: [
            {
              id: v4(),
              title: text,
              description: text
            },
            ...prev.todo.items
          ]
        }
      }
    })
    setText("")

    var requestPayload = {
      "title": text,
      "description": text,
      "status": "todo",
    }

    fetch(process.env.REACT_APP_TODO_CREATE_URL, {
      method: 'POST',
      // We convert the React state to JSON and send it as the POST body
      body: JSON.stringify(requestPayload)
    }).then(function (response) {
      console.log(response)
      return response.json();
    });
  }
  const removeItem = (id)   => {
    
    var requestPayload = {
      "id": parseInt(id)
    }

    console.log(requestPayload)
    fetch(process.env.REACT_APP_TODO_DELETE_URL, {
      method: 'POST',
      // We convert the React state to JSON and send it as the POST body
      body: JSON.stringify(requestPayload)
    }).then(function (response) {
      console.log(response)
    });
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
                                      <button id={"delete-button-"+el.id} onClick={() => {removeItem(el.id)}} value={el.id}>Delete</button>
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
