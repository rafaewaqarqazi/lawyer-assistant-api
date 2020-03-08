import React, {useEffect, useState} from 'react';
import {
  Avatar, Box, Button, Grid, TextField, Typography,
  OutlinedInput, InputLabel, MenuItem, FormControl, Select,
  LinearProgress, Container, Tooltip
} from "@material-ui/core";
import Link from "next/link";
import {useSignInStyles} from "../src/material-styles/signin-styles";
import CopyrightComponent from "./CopyrightComponent";
import {signup} from "../auth";
import router from 'next/router';
import SuccessSnackBar from "./snakbars/SuccessSnackBar";
import ErrorSnackBar from "./snakbars/ErrorSnackBar";
import {fetchBatchesAPI} from "../utils/apiCalls/users";
import Paper from "@material-ui/core/Paper";
import Chip from "@material-ui/core/Chip";
import {makeStyles} from "@material-ui/styles";

const useStyles = makeStyles(theme => ({
  moduleChip: {
    padding: theme.spacing(1)
  },
  chip: {
    margin: theme.spacing(0.5),
  }
}))
const SignUpComponent = () => {
  const classes = useSignInStyles();
  const signUpClasses = useStyles();
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    mobileNo: '',
    institute: '',
    qualification: '',
    skills:[]
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    open: false,
    message: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: {
      show: false,
      message: ''
    },
    email: {
      show: false,
      message: ''
    },
    password: {
      show: false,
      message: ''
    },
    mobileNo: {
      show: false,
      message: ''
    },
    institute: {
      show: false,
      message: ''
    },
    qualification: {
      show: false,
      message: ''
    },
    skills: {
      show: false,
      message: ''
    },
  });
  const [resMessage, setResMessage] = useState({
    open: false,
    message: '',
    id: ''
  });
  const handleChange = event => {
    setFormErrors({
      name: {
        show: false,
        message: ''
      },
      email: {
        show: false,
        message: ''
      },
      password: {
        show: false,
        message: ''
      },
      mobileNo: {
        show: false,
        message: ''
      },
      institute: {
        show: false,
        message: ''
      },
      qualification: {
        show: false,
        message: ''
      },
      skills: {
        show: false,
        message: ''
      },
    });
    setValues({...values, [event.target.name]: event.target.value})
  };
  const isValid = () => {
    if (values.name.trim().length === 0) {
      setFormErrors({
        ...formErrors,
        name: {
          show: true,
          message: 'Name Should not be Empty'
        }
      });
      return false;
    } else if (!values.email.match(/\S+@\S+\.\S+/)) {
      setFormErrors({
        ...formErrors,
        email: {
          show: true,
          message: 'Please Provide valid Email'
        }
      });
      return false;
    } else if (values.password.length < 8) {
      setFormErrors({
        ...formErrors,
        password: {
          show: true,
          message: 'Password Should have min 8 characters'
        }
      });
      return false;
    } else if (!values.password.match(/\d/)) {
      setFormErrors({
        ...formErrors,
        password: {
          show: true,
          message: 'Password Should include at-least one number'
        }
      });
      return false;
    } else if (!values.mobileNo.match(/^[0-9]{11}$/)) {
      setFormErrors({
        ...formErrors,
        mobileNo: {
          show: true,
          message: 'Invalid!'
        }
      });
      return false;
    } else if (values.institute === '') {
      setFormErrors({
        ...formErrors,
        institute: {
          show: true,
          message: 'Required!'
        }
      });
      return false;
    } else if (values.qualification === '') {
      setFormErrors({
        ...formErrors,
        qualification: {
          show: true,
          message: 'Required!'
        }
      });
      return false;
    } else if (values.skills.length === 0) {
      setFormErrors({
        ...formErrors,
        skills: {
          show: true,
          message: 'Required!'
        }
      });
      return false;
    }
    return true;
  };
  const handleSubmit = e => {
    e.preventDefault();
    if (isValid()) {
      setLoading(true);
      const user = {
        name: values.name,
        email: values.email.toLowerCase(),
        password: values.password,
        mobileNo: values.mobileNo,
        lawyer_details: {
          qualification: values.qualification,
          institute: values.institute,
          skills: values.skills
        }
      };
      signup(user)
        .then(data => {
          setLoading(false);
          if (data.error) {
            setError({open: true, message: data.error})
          } else {
            setResMessage({open: true, message: data.message, id: data._id})
          }
        })
        .catch(err => {
          console.log(err)
        })
    }
  };

  const handleSuccess = () => {
    setResMessage({...resMessage, open: false, message: ''});
    router.push(`/verify-email/[id]`, `/verify-email/${resMessage.id}`)
  };
  const handleError = () => {
    setError({open: false, message: ''})
  };
  const handleSubmitSkills = e => {
    e.preventDefault();
    if (currentSkill.trim() !== '') {
      setValues({
        ...values,
        skills: [
          ...values.skills,
          {
            key: values.skills.length + 1,
            label: currentSkill
          }
        ]
      });
      setCurrentSkill('')
    }
  };
  const handleDelete = skillToDelete => {
    setValues({
      ...values,
      skills: values.skills.filter(skill => skill.key !== skillToDelete.key)
    });
  };
  const handleChangeSkill = e => {
    setFormErrors({...formErrors,
      skills: {
        show: false,
        message: ''
    }});
    setCurrentSkill(e.target.value);
  }
  return (
    <div>
      {loading && <LinearProgress color='secondary'/>}
      <Container component="main" maxWidth="sm">
        <div className={classes.paper}>
          <Avatar alt="Lawyer-Assistant" src="/static/avatar/logo.jpg" className={classes.avatar}/>
          <Typography component="h1" variant="h5">
           Sign up
          </Typography>
        </div>
        <div className={classes.root}>
          <SuccessSnackBar open={resMessage.open} message={resMessage.message} handleClose={handleSuccess}/>
          <ErrorSnackBar message={error.message} open={error.open} handleSnackBar={handleError}/>
        </div>

        <div className={classes.form}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                variant="outlined"
                required
                fullWidth
                id="fullName"
                value={values.name}
                onChange={handleChange}
                label="Full Name"
                autoFocus
                error={formErrors.name.show}
                helperText={formErrors.name.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                required
                value={values.email}
                onChange={handleChange}
                fullWidth
                id="email"
                label="Email Address"
                name="email"

                error={formErrors.email.show}
                helperText={formErrors.email.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                value={values.password}
                onChange={handleChange}
                name="password"
                label="Password"
                type="password"
                id="password"
                error={formErrors.password.show}
                helperText={formErrors.password.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                type="tel"
                value={values.mobileNo}
                onChange={handleChange}
                name="mobileNo"
                label="Mobile No"
                id="mobileNo"
                placeholder={'03001234567'}
                error={formErrors.mobileNo.show}
                helperText={formErrors.mobileNo.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                value={values.institute}
                onChange={handleChange}
                name="institute"
                label="Law School/Institute"
                id="institute"
                error={formErrors.institute.show}
                helperText={formErrors.institute.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                  variant="outlined"
                  required
                  fullWidth
                  value={values.qualification}
                  onChange={handleChange}
                  name="qualification"
                  label="Qualification"
                  id="qualification"
                  error={formErrors.qualification.show}
                  helperText={formErrors.qualification.message}
              />
            </Grid>
            <Grid item xs={12}>
              <form id='skill-form' onSubmit={handleSubmitSkills}>
                <TextField
                    variant="outlined"
                    required
                    fullWidth
                    value={currentSkill}
                    onChange={handleChangeSkill}
                    name="currentSkill"
                    label="Add Skills"
                    error={formErrors.skills.show}
                    helperText={formErrors.skills.message}
                />
                <Paper className={signUpClasses.moduleChip}>
                  {values.skills.length > 0 ? values.skills.map(skill => {
                        return (
                            <Chip
                                key={skill.key}
                                variant='outlined'
                                color='secondary'
                                label={skill.label}
                                onDelete={() => handleDelete(skill)}
                                className={signUpClasses.chip}
                            />
                        );
                      }) :
                      <Chip
                          variant='outlined'
                          color='primary'
                          label={'No Skills Added Yet'}
                          className={signUpClasses.chip}
                      />
                  }
                </Paper>
              </form>
            </Grid>
          </Grid>

          <Button
            onClick={handleSubmit}
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign Up
          </Button>
          <Grid container justify="center">
            <Grid item>
              <Link href="/">
                <a>Already have an account? Sign in</a>
              </Link>
            </Grid>
          </Grid>
        </div>
        <Box mt={5}>
          <CopyrightComponent/>
        </Box>
      </Container>
    </div>

  );
};

export default SignUpComponent;