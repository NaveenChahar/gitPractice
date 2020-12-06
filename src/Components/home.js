import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import axios from 'axios';
import './home.css'

class Home extends Component {

    initialState = {
        //fields to store the form data and errors
        parentname: '',
        parentnameError: '',
        parentcontactno: '',
        parentcontactnoError: '',
        parentemail: '',
        parentemailError: '',
        childname: '',
        childnameError: '',
        childage: '',
        childageError: '',
        coursename: '',
        coursedate: '',
        coursetime: '',
        coursedata: [],
        slotdata: [],
        slots: []
    }

    //store seven dates from the current time
    dates = [];

    //Menuprops is passed to dropdown in order to control its max-height(material-ui react)
    ITEM_HEIGHT = 48;
    ITEM_PADDING_TOP = 8;
    MenuProps = {
        PaperProps: {
            style: {
                maxHeight: this.ITEM_HEIGHT * 4.5 + this.ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    constructor(props) {
        super(props);
        this.state = this.initialState;
        this.getCourseData();
        this.setslotdates();
    }

    //fetching all the details of the courses
    getCourseData() {
        axios.get('https://script.google.com/macros/s/AKfycbzJ8Nn2ytbGO8QOkGU1kfU9q50RjDHje4Ysphyesyh-osS76wep/exec')
            .then(response => {
                console.log(response)
                if (response.data) {
                    this.setState({ coursedata: response.data })
                }
            })
            .catch(err => {
                console.log(err);
            })
    }

    //set the list of available dates to choose from
    setslotdates() {
        var dt = new Date();
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 0; i < 7; i++) {
            let dtobj = {
                date: dt.getDate(),
                month: months[dt.getMonth()],
                year: dt.getFullYear(),
                fullformatdate: dt
            }
            this.dates.push(dtobj);
            dt.setDate(dt.getDate() + 1);
        }
    }

    //handle the submit disable by checking all the validations
    validate() {
        if (this.state.parentname.length >= 4 && this.state.childname.length >= 4
            && /^[6-9]\d{9}$/i.test(this.state.parentcontactno) && this.state.parentemail.includes('@')
            && (this.state.childage >= 2 && this.state.childage <= 50) && (this.state.coursename
                && this.state.coursedate && this.state.coursetime)) {
            return true;
        }
        else {
            return false;
        }
    }

    //handle the name validations
    handleParentName = input => event => {
        this.setState({ parentname: event.target.value });
        if (event.target.value.length < 4) {
            this.setState({ parentnameError: 'Name atleast 4 characters' })
        }
        else {
            this.setState({ parentnameError: '' })
        }

    }

    //handle the validation for mobile number format
    handlePhoneNo = input => event => {
        this.setState({ parentcontactno: event.target.value });
        if (!/^[6-9]\d{9}$/i.test(event.target.value)) {
            this.setState({ parentcontactnoError: 'Phone No format incorrect' })
        }
        else {
            this.setState({ parentcontactnoError: '' })
        }

    }


    //handle Email Validations
    handleEmail = input => event => {
        this.setState({ parentemail: event.target.value });
        if (!event.target.value.includes('@')) {
            this.setState({ parentemailError: 'Email should be proper' })
        }
        else {
            this.setState({ parentemailError: '' })
        }

    }

    handleChildName = input => event => {
        this.setState({ childname: event.target.value });
        if (event.target.value.length < 4) {
            this.setState({ childnameError: 'Name atleast 4 characters' })
        }
        else {
            this.setState({ childnameError: '' })
        }

    }

    //handle the validation for child's age
    handleChildAge = input => event => {
        this.setState({ childage: event.target.value });
        //console.log(typeof((event.target.value-0)))
        if ((event.target.value < 2 || event.target.value > 50)) {
            this.setState({ childageError: 'Age should be between 2 to 50' })
        }
        else {
            this.setState({ childageError: '' })
        }

    }

    handleCourseName = input => event => {
        this.setState({ coursename: event.target.value, coursedate: '', slots: [], coursetime: '' });

        //set the slotdata to the slots of the course which was chosen
        for (let key in this.state.coursedata) {
            if (this.state.coursedata[key].course_name == event.target.value) {
                this.setState({ slotdata: this.state.coursedata[key].slots });
            }
        }
    }

    handleCourseDate = input => event => {
        this.setState({ coursedate: event.target.value, slots: [], coursetime: '' });
        //set the timing slot based on the date chosen
        //if current date is chosen then set the 4hrs limit
        var tempslots = [];
        for (let slot of this.state.slotdata) {
            if (slot) {
                let num = slot.slot - 0;
                let slotdate = new Date(num);
                let coursedate = event.target.value;
                let currentdate = new Date();
                //console.log(slotdate,coursedate,currentdate);
                if (slotdate.getDate() == coursedate.date &&
                    slotdate.getMonth() == coursedate.fullformatdate.getMonth()
                    && slotdate.getFullYear() == coursedate.year) {
                    if (slotdate.getDate() == currentdate.getDate() &&
                        (slotdate.getHours() * 60 + slotdate.getMinutes() -
                            currentdate.getHours() * 60 - currentdate.getMinutes() < 240)) {

                    }
                    else {
                        tempslots.push(slotdate);
                    }
                }
            }
        }
        if (tempslots) {
            this.changetimeformat(tempslots);
        }

    }

    //change the timeformat of slots from 24hrs format to am-pm format
    //and define the end timing of the slots as well
    changetimeformat(tempslots) {
        var newformatslots = [];
        for (let slot of tempslots) {
            let newslot = {
                starthour: 0,
                startmin: 0,
                startampm: '',
                endhour: 1,
                endmin: 0,
                endampm: ''
            }

            newslot.starthour = slot.getHours();
            newslot.startmin = slot.getMinutes();
            newslot.startampm = (newslot.starthour >= 12) ? 'P.M' : 'A.M';
            newslot.endhour = slot.getHours() + 1;
            newslot.endmin = slot.getMinutes();
            newslot.endampm = (newslot.endhour >= 12) ? 'P.M' : 'A.M';

            newslot.starthour = (newslot.starthour > 12) ? newslot.starthour - 12 : newslot.starthour;
            newslot.starthour = (newslot.starthour == 0) ? 12 : newslot.starthour;

            newslot.endhour = (newslot.endhour > 12) ? newslot.endhour - 12 : newslot.endhour;
            newslot.endhour = (newslot.endhour == 0) ? 12 : newslot.endhour;

            newslot.starthour = (newslot.starthour < 10) ? ('0' + newslot.starthour) : '' + newslot.starthour;
            newslot.endhour = (newslot.endhour < 10) ? ('0' + newslot.endhour) : '' + newslot.endhour;

            newslot.startmin = (newslot.startmin < 10) ? ('0' + newslot.startmin) : '' + newslot.startmin;
            newslot.endmin = (newslot.endmin < 10) ? ('0' + newslot.endmin) : '' + newslot.endmin;

            newformatslots.push(newslot);
        }
        this.setState({ slots: newformatslots });
    }


    handleCourseTime = input => event => {
        this.setState({ coursetime: event.target.value });

    }

    submit() {
        //send state to backend
        if (this.validate()) {
            //alert('Form Data Valid')
            window.location.reload();
        }
        else {
            alert('Form Data Invalid')
        }

    }

    render() {
        return (
            <div>
                <div><h3>Please Fill the given form</h3></div>
                <div>
                    <div className={'eachel'}>
                        <TextField style={{ width: '100%' }}
                            label="Parent Name"
                            placeholder="Enter Parent's Name"
                            error={this.state.parentnameError ? true : false}
                            className="inputField"
                            helperText={this.state.parentnameError}
                            onChange={this.handleParentName('parentname')}
                        />
                        <br />
                    </div>
                    <div className={'eachel'}>
                        <TextField style={{ width: '100%' }}
                            placeholder="Enter 10 digit mobile no"
                            label="Parent Mobile No"
                            error={this.state.parentcontactnoError ? true : false}
                            className="inputField"
                            helperText={this.state.parentcontactnoError}
                            onChange={this.handlePhoneNo('phoneno')}
                        />
                        <br />
                    </div>
                    <div className={'eachel'}>
                        <TextField style={{ width: '100%' }}
                            placeholder="Enter Parent's Email"
                            label="Parent Email"
                            error={this.state.parentemailError ? true : false}
                            className="inputField"
                            helperText={this.state.parentemailError}
                            onChange={this.handleEmail('parentemail')}
                        />
                        <br />
                    </div>
                    <div className={'eachel'}>
                        <TextField style={{ width: '100%' }}
                            label="Child's Name"
                            placeholder="Enter Child's Name"
                            error={this.state.childnameError ? true : false}
                            className="inputField"
                            helperText={this.state.childnameError}
                            onChange={this.handleChildName('childname')}
                        />
                        <br />
                    </div>
                    <div className={'eachel'}>
                        <TextField style={{ width: '100%' }}
                            label="Child's Age"
                            placeholder="Enter Child's Age"
                            type="number"
                            error={this.state.childageError ? true : false}
                            className="inputField"
                            helperText={this.state.childageError}
                            onChange={this.handleChildAge('childage')}
                        />
                        <br />
                    </div>
                    <div className={'eachel'}>
                        <FormControl className="dropdown">
                            <InputLabel>Select Course</InputLabel>
                            <Select
                                MenuProps={this.MenuProps}
                                value={this.state.coursename || ''}
                                labelId="demo-simple-select-label"
                                onChange={this.handleCourseName('coursename')}
                            >
                                {(this.state.coursedata.length != 0) ? null : <MenuItem>Fetching Courses</MenuItem>}
                                {this.state.coursedata.map((course, i) => (
                                    <MenuItem value={course.course_name} key={i}>{course.course_name}</MenuItem>
                                ))}

                            </Select>
                        </FormControl>
                    </div>
                    <div className={'eachel'}>
                        <FormControl className="dropdown">
                            <InputLabel>Select Date</InputLabel>
                            <Select
                                MenuProps={this.MenuProps}
                                value={this.state.coursedate || ''}
                                labelId="demo-simple-select-label"
                                onChange={this.handleCourseDate('coursedate')}
                            >
                                {this.dates.map((date, i) => (
                                    <MenuItem value={date} key={i}>{date.date} {date.month}</MenuItem>
                                ))}

                            </Select>
                        </FormControl>
                    </div>
                    <div className={'eachel'}>
                        <FormControl className="dropdown">
                            <InputLabel>Select Slot Timing</InputLabel>
                            <Select
                                MenuProps={this.MenuProps}
                                value={this.state.coursetime || ''}
                                labelId="demo-simple-select-label"
                                onChange={this.handleCourseTime('coursedate')}
                            >
                                {(this.state.slots.length != 0) ? null : <MenuItem>No Slots Available</MenuItem>}
                                {this.state.slots.map((slot, i) => (
                                    <MenuItem value={slot} key={i}>{slot.starthour} : {slot.startmin} {slot.startampm} to {slot.endhour} : {slot.endmin} {slot.endampm}</MenuItem>
                                ))}

                            </Select>
                        </FormControl>
                    </div>

                    <Button color="primary" variant="contained" onClick={this.submit.bind(this)}
                        style={{ margin: '20px' }}>
                        Submit
                </Button>
                </div>
            </div>

        );
    }
}

export default Home;