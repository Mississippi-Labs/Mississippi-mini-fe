import { useEffect, useRef, useState } from 'react';
import './styles.scss';
import Header from './header';
import UserInfo from './userInfo';
import fightIcon from '@/assets/img/fight-icon.png';
import Dialog from '@/pages/ffa/dialog';
import DuelField, { IDuelFieldMethod } from '@/components/DuelField';
import { playerA, playerB, Rank1, Rank2 } from '@/mock/data';
import { ethers } from 'ethers';

import miniAbi from '@/abi/mississippi_mini-game.json';
import { Skills } from '@/config/hero';
import { type } from 'os';

const rpc = 'https://starknet-goerli.infura.io/v3/5ca372516740427e97512d4dfefd9c47';
const key = '0x1374ef8311b490e1a3ae8e63f4cb1c602e6620d4a7bd87c66c44152b27770b4';

const FFA = () => {

  const [tab, setTab] = useState('home');

  const [dialogVisible, setDialogVisible] = useState(false);
  const [nameDialogVisible, setNameDialogVisible] = useState(false);
  const [skillDialogVisible, setSkillDialogVisible] = useState(false);
  const [battleResultDialogVisible, setBattleResultDialogVisible] = useState(false);
  const [battleResult, setBattleResult] = useState('');
  const [skillName, setSkillName] = useState('');
  const [battleVisible, setBattleVisible] = useState(false);
  const [mintState, setMintState] = useState('init');
  const [fighting, setFighting] = useState(false);
  const [attacker, setAttacker] = useState({...playerA});
  const [defer, setDefer] = useState({...playerB});
  const battleRef = useRef<IDuelFieldMethod>();
  const [round, setRound] = useState(0);
  const [attackRole, setAttackRole] = useState('left');
  const [logs, setLogs] = useState([]);
  const [rankData, setRankData] = useState(Rank1);

  const [player, setPlayer] = useState();

  useEffect(() => {
    try {
      // const provider = new ethers.providers.JsonRpcProvider(rpc)
      // const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);
      // const contact = new ethers.Contract(key, miniAbi.abi, wallet);
    } catch (e) {
      console.log(e)
    }

  }, []);

  // useEffect(() => {
  //   if (fighting) {
  //     const interval = setInterval(() => {
  //       battleRef.current?.leftAttack('sprint');
  //       defer.hp -= attacker.attack - defer.def;
  //       if (defer.hp <= 0) {
  //         defer.hp = 0;
  //         clearInterval(interval);
  //         showBattleResult('win');
  //         // setTimeout(() => {
  //         //   battleRef.current?.kill('right');
  //         // }, 1000)
  //       } else {
  //         setTimeout(() => {
  //           battleRef.current?.rightAttack('sprint');
  //           attacker.hp -= defer.attack - attacker.def;
  //           if (attacker.hp <= 0) {
  //             attacker.hp = 0;
  //             clearInterval(interval);
  //             showBattleResult('lose');
  //             // setTimeout(() => {
  //             //   battleRef.current?.kill('left');
  //             // }, 1000)
  //           }
  //           setAttacker({...attacker});
  //         }, 3000)
  //       }
  //       setDefer({...defer});
  //     }, 8000);
  //   }
  // }, [fighting]);

  useEffect(() => {
    if (round > 0) {
      if (attackRole === 'left') {
        battleRef.current?.leftAttack('sprint');
        defer.hp -= attacker.attack - defer.def;
        if (defer.hp <= 0) {
          defer.hp = 0;
          showBattleResult('win');
          setRound(0);
          setLogs([1]);
          setRankData(Rank2);
        } else {
          setTimeout(() => {
            setRound((prevState => prevState + 1));
            setAttackRole('right');
          }, 3000)
        }
        setDefer({...defer});
      } else {
        battleRef.current?.rightAttack('sprint');
        attacker.hp -= defer.attack - attacker.def;
        if (attacker.hp <= 0) {
          attacker.hp = 0;
          showBattleResult('lose');
          setRound(0);
        } else {
          setTimeout(() => {
            setRound((prevState => prevState + 1));
            if (round % 3 === 0 && round <= 15) {
              console.log('追击');
            } else {
              setAttackRole('left');
            }
          }, 3000)
        }
        setAttacker({...attacker});
      }
    }
    console.log(round);
  }, [round]);

  const mint = () => {
    setNameDialogVisible(true);
  }

  const create = () => {
    setNameDialogVisible(false);
    setMintState('minting');
    setTimeout(() => {
      setPlayer(playerA);
      setMintState('finished');
    }, 3000)
  }

  const selectSkill = (name) => {
    setSkillDialogVisible(true);
    setSkillName(name);
  }

  const startBattle = () => {
    const skillType = Skills.find(item => item.name === skillName).type;
    switch (skillType) {
      case 'spd':
        attacker.speed += 15;
        break;
      case 'hp':
        attacker.hp += 100;
        attacker.maxHp += 100;
        break;
    }
    setAttacker({...attacker});
    setSkillDialogVisible(false);
    setFighting(true);
    setRound(1);
  }

  const showBattleResult = (result) => {
    setTimeout(() => {
      setBattleVisible(false);
      setBattleResultDialogVisible(true);
      setBattleResult(result);
    }, 3000);
  }

  const myRank = rankData.find(item => item.name === 'Alice');

  return (
    <div className={'ffa-page'}>

      <Header/>

      <section className={'ffa-section'}>
        <div className="ffa-switch-wrapper">
          <h2
            className={`switch-item ${tab === 'home' ? 'active' : ''}`}
            onClick={() => {
              setTab('home')
            }}
          >Home</h2>
          <h2
            className={`switch-item ${tab === 'battle' ? 'active' : ''}`}
            onClick={() => {
              setTab('battle')
            }}
          >Battle</h2>
        </div>
        {
          tab === 'home' && <>
            <UserInfo player={player}/>
            {
              mintState !== 'finished' && (
                <button className="mi-btn" onClick={mint}>{
                  mintState === 'init' ? 'Mint' : 'Minting...'
                }</button>
              )
            }
          </>
        }

        {
          tab === 'battle' && <div className={'ffa-battle-wrapper'} >
            <div className="left-content">
              <h3>Leaderboard</h3>
              <div className="leaderboard-wrapper">
                <ul className={'leaderboard-list'}>
                  {
                    rankData.map((data, index) => {
                      return (
                        <li className={'rank-row'}>
                          <div className="rank-num">{index + 1}</div>
                          <div className="username">{data.name}</div>
                          <div className="addr">{data.address}</div>
                          <div className="win-count">V{data.win}</div>
                          <div className="lose-count">D{data.lose}</div>
                          {
                            data.name !== 'Alice' && (
                              <div
                                className="fight-icon"
                                onClick={() => {
                                  setDialogVisible(true);
                                }}
                              >
                                <img src={fightIcon} alt="fight"/>
                              </div>
                            )
                          }

                        </li>
                      )
                    })
                  }

                </ul>
                <div className="my-rank-info rank-row">
                  <div className="rank-num">{rankData.findIndex(item => item.name === 'Alice') + 1}</div>
                  <div className="username">{myRank.name}</div>
                  <div className="addr">0x34..35</div>
                  <div className="win-count">V{myRank.win}</div>
                  <div className="lose-count">D{myRank.lose}</div>
                </div>
              </div>
            </div>
            <div className="right-content">
              <h3>My Battle Logs</h3>
              <ul className="ffa-logs-wrapper">
                {
                  logs.map((log) => {
                    return (
                      <li key={log.time}>
                        <div className="ffa-content">I challenged Bob Victory</div>
                        <time>12/30 20:20</time>
                      </li>
                    )
                  })
                }
                {/*<li>*/}
                {/*  <div className="ffa-content">I challenged Bob Victory</div>*/}
                {/*  <time>12/30 20:20</time>*/}
                {/*</li>*/}
                {/*<li>*/}
                {/*  <div className="ffa-content">Bob challenged me Lose</div>*/}
                {/*  <time>12/29 21:20</time>*/}
                {/*</li>*/}
              </ul>
            </div>
          </div>
        }
      </section>
      <Dialog visible={dialogVisible}>
        <div className={'dialog-user'}>
          <div className="dialog-userinfo">
            <div className="username">{defer.name}</div>
            <dl>
              <dt>HP</dt>
              <dd>{defer.maxHp}</dd>
            </dl>
            <dl>
              <dt>Attack</dt>
              <dd>{defer.attack}</dd>
            </dl>
            <dl>
              <dt>Defense</dt>
              <dd>{defer.def}</dd>
            </dl>
            <dl>
              <dt>Speed</dt>
              <dd>{defer.speed}</dd>
            </dl>
          </div>

          <div className="dialog-opt">
            <button
              className="battle-opt mi-btn"
              onClick={() => {
                setBattleVisible(true);
                setDialogVisible(false);
              }}>Battle</button>
            <button
              className="battle-opt mi-btn"
              onClick={() => {
                setDialogVisible(false);
              }}
            >OK</button>

          </div>
        </div>
      </Dialog>
      <Dialog visible={nameDialogVisible}>
        <p className={'mint-name-text'}>
          You have successfully created a wallet.Name your character and start your journey!
        </p>
        <div className="mint-name">
          <input type="text" className="mi-input"/>
          <button className="mi-btn" onClick={create}>OK</button>
        </div>
      </Dialog>
      <Dialog visible={skillDialogVisible}>
        <div className="skill-dialog-content">
          <h3>Skill</h3>
          <p>Select {skillName} as your skill</p>
          <div className="opt-wrapper">
            <button className="mi-btn" onClick={startBattle}>CONFIRM</button>
            <button className="mi-btn" onClick={() => setSkillDialogVisible(false)}>Back</button>
          </div>
        </div>

      </Dialog>
      <Dialog visible={battleResultDialogVisible}>
        <div className="battle-result-content">
          <h3>BATTLE RESULT</h3>
          <pre>
          {
            battleResult === 'win' ?
              'Congratulations! \n You are the winner!'
              :
              'You lost. \n Come and try again. '
          }
          </pre>
          <button className="mi-btn" onClick={() => setBattleResultDialogVisible(false)}>OK</button>
        </div>
      </Dialog>
      {
        battleVisible && (
          <div className="ffa-battle-dialog-wrapper">
          <div className="ffa-battle-dialog">
            <div className="icon-rect"/>
            <div className="icon-rect"/>
            <div className="icon-rect"/>
            <div className="icon-rect"/>

            {
              !fighting && (
                <div className="skills-desc">
                  <ul className="skill-list">
                    {
                      Skills.map((item) => (
                        <li className={`skill-item skill-${item.type}`} key={item.name} onClick={() => selectSkill(item.name)}>
                          <div className="txt" >{item.name}</div>
                        </li>
                      ))
                    }
                  </ul>

                  <div className="desc-txt">
                    Select one of the three skills for the battle: <br/>
                    HP Boost: Increases HP by 100. <br/>
                    SPD Surge: Boosts speed by 100. <br/>
                    Chain ATK: 20% chance of a consecutive attack.
                  </div>
                </div>
              )
            }
            <div className="battle-user-info player1">
              <div className="battle-user-info-detail">
                <div className="username">{attacker.name}</div>
                <div>ATK {attacker.attack}</div>
                <div>DEF {attacker.def}</div>
                <div>SPD {attacker.speed}</div>
              </div>

              <div className="hp-wrapper">
                <div className="hp" >
                  <div className="hp-bar" style={{ width: `${attacker.hp * 100 / attacker.maxHp}%` }}/>
                  {attacker.hp}/{attacker.maxHp}
                </div>
              </div>
            </div>

            <div className="battle-user-info player2">
              <div className="battle-user-info-detail">
                <div className="username">{defer.name}</div>
                <div>ATK {defer.attack}</div>
                <div>DEF {defer.def}</div>
                <div>SPD {defer.speed}</div>
              </div>

              <div className="hp-wrapper">
                <div className="hp">
                  <div className="hp-bar" style={{ width: `${defer.hp * 100 / defer.maxHp}%` }}/>
                  {defer.hp}/{defer.maxHp}
                </div>
              </div>
            </div>

            <ul className="skill-list attacker-skill">
              <li className={`skill-item skill-${Skills.find(item => item.name === skillName)?.type}`}>
              </li>
            </ul>

            <ul className="skill-list defer-skill">
              <li className={`skill-item skill-atk`}>
              </li>
            </ul>

            <DuelField
              ref={battleRef}
              leftPlayer={playerA}
              rightPlayer={playerB}
            />
          </div>
          </div>
        )
      }

    </div>
  );
};

export default FFA;