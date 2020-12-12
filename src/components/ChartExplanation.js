import React from 'react';

export default function Explainer(props) {
    let invalid = props.explainer === null;
    
    return(
        <div>
            {props.state === "TOTAL" || invalid ? 
            <div style={{textAlign: "start"}}>
                The model's prediction for the total COVID-19 cases across all states in the U.S. is based on individual predictions of COVID-19 cases per state. To understand this prediction in more detail, please select the dropdown at the top of the line graph to examine the COVID-19 cases and predictions for different states. If you can't see details for each state, there might be a delay fetching data from the server, or we can't find the LIME explainer information for this state.
            </div> 
            : 
            <div style={{textAlign: "start"}}>
                Results indicate that our model predicts that {props.state} will experience a {props.explainer.increase} in COVID-19 cases the following day. This is based on the trend of COVID-19 cases over the past 3 days, where results have indicated that the overall trend is mostly {props.explainer.increase}. From our model, the cases in {props.state} is {props.explainer.significance}, based on the distribution of reported cases. It is important to note, however, that there is still a level of uncertainty with the forecasts, so we recommend taking caution when planning outings or trips.
            </div>}
        </div>
    )

}