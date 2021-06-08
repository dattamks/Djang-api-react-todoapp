import React from 'react';
import './App.css';

const fetch = require('node-fetch');
class App extends React.Component{
  constructor(props){
    super(props);
      this.state = {
        todolist:[],
        activeItem:{
          id:null,
          title:'',
          compleated:false,
        },
        editing:false,
      }
      this.fetchTasks = this.fetchTasks.bind(this)
      this.handleChange = this.handleChange.bind(this)
      this.handleSubmit = this.handleSubmit.bind(this)
      this.getCookie = this.getCookie.bind(this)
      this.deleteItem = this.deleteItem.bind(this)
      this.strikeunstrike = this.strikeunstrike.bind(this)
      
  };


  getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

  componentWillMount(){
    this.fetchTasks()
  }
 
  fetchTasks(){
    console.log('fet')
    fetch('http://127.0.0.1:8000/api/task-list/')
    .then(res => res.json())
    .then(json => this.setState({todolist:json}));
      
      
  }
  handleChange(e){
    var name = e.target.name
    var value = e.target.value
    console.log('name:',name)
    console.log('value:',value)
    this.setState({
      activeItem:{
        ...this.state.activeItem,
        title:value
      }
    })
  }

  handleSubmit(e){
    e.preventDefault()
    console.log('item:', this.state.activeItem)
    var csrftoken = this.getCookie('csrftoken');
    var url = 'http://127.0.0.1:8000/api/task-create/'
    if (this.state.editing ==true){
      url = `http://127.0.0.1:8000/api/task-update/${ this.state.activeItem.id }/`
      this.setState({
        editing:false
      })
    }
    fetch(url,{
      method:'POST',
      headers:{
        'Content-type':'application/json',
        'X-CSRFToken':csrftoken,
      },
      body:JSON.stringify(this.state.activeItem)
    }).then((response) => {
      this.fetchTasks()
      this.setState({
        activeItem:{
          id:null,
          title:'',
          compleated:false,
        }
      })
    }).catch(function(error){
      console.log('Error:',error)
    })

  }
  startediting(task){
    this.setState({
      activeItem:task,
      editing:true,
    })
  }

  deleteItem(task){
    var csrftoken = this.getCookie('csrftoken');
    fetch(`http://127.0.0.1:8000/api/task-delete/${task.id}/`,{
      method:'DELETE',
      headers:{
        'content-type':'application/json',
        'X-CSRFToken':csrftoken
      },
    }).then((response) =>{
      this.fetchTasks()
    })
  }

  strikeunstrike(task){
    var csrftoken = this.getCookie('csrftoken');
    var url = `http://127.0.0.1:8000/api/task-update/${ task.id }/`
    task.compleated = !task.compleated
      fetch(url,{
        method:'POST',
        headers:{
          'content-type':'application/json',
          'X-CSRFToken':csrftoken
        },
        body:JSON.stringify({'compleated':task.compleated,'title':task.title})
      }).then(() =>{
        this.fetchTasks()
      })

    console.log('TASK:',task.compleated)
  }
  render(){
    var tasks = this.state.todolist
    var self = this
    return(
      <div className='container' >
        <div id='task-container'>
          <div id='form-wraper'>
            <form id='form' onSubmit={this.handleSubmit}>
              <div className='flex-wrapper'>
                <div style={{flex:6}}>
                    <input onChange={this.handleChange} id='title' className='form-control' value={this.state.activeItem.title} name='title' placeholder='Add Task'/>
                </div>
                <div style={{flex:1}}>
                    <input id='submit' className='btn btn-warning' type='submit' name='add' />
                </div>

              </div>

            </form>

          </div>
          <div id='list-wraper'>
            {tasks.map(function(task, index){
              return(
                <div key={index} className='task-wrapper flex-wrapper'>
                  <div onClick={() => self.strikeunstrike(task)} style={{flex:7}}>
                    {task.compleated == false ? (
                      <span>{task.title}</span>
                    ):(
                      <strike>{task.title}</strike>
                    )}
                    
                  </div>
                  <div style={{flex:1}}>
                    <button onClick={()=> self.startediting(task)} className='btn btn-sm btn-outline-info'>Edit</button>
                  </div>
                  <div style={{flex:1}}>
                    <button onClick={()=> self.deleteItem(task)} className='btn btn-sm btn-outline-dark'>-</button>
                  </div>
                </div>
                  
                
              )
            })}
          </div>

        </div>

      </div>

    )
  }
}
export default App;

