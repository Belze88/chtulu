import React from 'react';
import Paragraphs from '../../shared/hoc/Paragraphs';
import RImageDetail from '../atoms/RImageDetail';

const UserPublicCard = (props) => {

    const {user} = props;
    if(!user) return null;

    const paragraphs =  Paragraphs(user.description||'pas encore de description');

    return (
        <div>
            <div className="row">
                <div className="col-md-12">
                    <div style={{float:'left',
                        clear:'left',
                        marginRight:'10px',
                        marginBottom:'4px'}}>
                        <RImageDetail id={user.detailImageResource} useDefault={true}/>
                    </div>
                    <h4>{user.username}</h4>
                    <i>{user.signature}</i><br/><br/>
                    {paragraphs}
                </div>
            </div>
        </div>
    );
};

export default UserPublicCard;