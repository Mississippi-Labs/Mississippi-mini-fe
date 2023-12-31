import { useEffect, useRef, useState } from 'react';
import './styles.scss';
import Header from './header';
import UserInfo from './userInfo';
import fightIcon from '@/assets/img/fight-icon.png';
import Dialog from '@/pages/ffa/dialog';
import DuelField from '@/components/DuelField';
import { playerA, playerB } from '@/mock/data';
import { useEntityQuery } from '@dojoengine/react'
import { Has, getComponentValue } from "@dojoengine/recs";
import { useDojo } from "../../DojoContext";
import { set } from 'mobx';

const FFA = () => {
  const {
    setup: {
      components: { BattleInfo, BattleResult, Player, Skill, Role },
      systemCalls: { chooseSkill, chooseRole, startBattle },
    },
    account: {
      clear,
      create,
      account,
      list,
      select
    },
  } = useDojo()

  const RoleData = useEntityQuery([Has(Role)]).map((entity) => getComponentValue(Role, entity));
  const PlayerData:any = useEntityQuery([Has(Player)]).map((entity) => {
    let player = getComponentValue(Player, entity);
    let addr:any = player?.addr;
    const bn = BigInt(addr);
    const hex = bn.toString(16);
    let role = RoleData.find((role:any) => role.id == player?.roleId);
    return {
      ...role,
      ...player,
      addr: '0x' + hex,
    }
  });
  const SkillData = useEntityQuery([Has(Skill)]).map((entity) => getComponentValue(Skill, entity));
  const BattleInfoData = useEntityQuery([Has(BattleInfo)]).map((entity) => getComponentValue(BattleInfo, entity));
  const BattleResultData = useEntityQuery([Has(BattleResult)]).map((entity) => getComponentValue(BattleResult, entity));
  console.log(SkillData, RoleData, PlayerData, 'SkillData')
  console.log(BattleInfoData, BattleResultData, 'BattleInfoData')

  const curPlayer = PlayerData.find((player: any) => player.addr.toLocaleLowerCase() == account.address.toLocaleLowerCase()) || {};
  
  const [tab, setTab] = useState('home');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [skillVisible, setSkillVisible] = useState(false);
  const [skillId, setSkillId] = useState(0);
  const [battleId, setBattleId] = useState(-1);
  const battleRef = useRef();
  
  const targetData:any = useRef();

  const chooseRoleFun = async () => {
    console.log(account, 'account')
    // 随机0or1
    let id = Math.floor(Math.random() * 2);
    await chooseRole(account, id);
  }

  const showDialog = (index:any) => {
    let player:any = PlayerData[index];
    targetData.current = player;
    setDialogVisible(true);
  }

  const closeDialog = () => {
    targetData.current = null;
    setDialogVisible(false);
    setSkillVisible(false)
  }

  const battleFun = async () => {
    let addr = targetData.current.addr;
    closeDialog()
    await chooseSkill(account, skillId);
    let event = await startBattle(account, addr)
    let battleId = event?.[0]?.data?.[5] || ''
    battleId = Number(battleId)
    setBattleId(battleId)
  }

  const formatAddress = (addr:string) => {
    return addr.slice(0, 6) + '...' + addr.slice(-6);
  }

  useEffect(() => {
    let battleResultData:any = BattleResultData.find((item:any) => item.battleId == battleId);
    if (battleResultData) {
      let win = battleResultData?.winner;
      console.log(battleResultData, 'win')
      const bn = BigInt(win);
      const hex = bn.toString(16);
      let winner = '0x' + hex;
      alert(winner == account.address ? 'You win!' : 'You lose!')
      setBattleId(-1)
    }
  }, [battleId])

  useEffect(() => {
    setSkillId(curPlayer?.skillId)
  }, [curPlayer?.skillId])

  useEffect(() => {
    const init = async () => {
      clear();
      const newAccount = await create();
      console.log(newAccount, 'newAccount')
      select(newAccount.address);
      localStorage.setItem('isFirst', '1');
    }
    let isFirst = localStorage.getItem('isFirst');
    console.log(isFirst, 'isFirst')
    if (!isFirst) {
      init()
    }
  }, [])

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
            <UserInfo player={curPlayer} />
            <button className="mi-btn" onClick={chooseRoleFun}>Mint</button>
          </>
        }

        {
          tab === 'battle' && <div className={'ffa-battle-wrapper'} >
            <div className="left-content">
              <h3>Leaderboard</h3>
              <div className="leaderboard-wrapper">
                <ul className={'leaderboard-list'}>
                  {
                    PlayerData.map((item:any, index:any) => (
                      <li className={'rank-row'} key={index}>
                        <div className="rank-num">{item.name.toString()}</div>
                        <div className="addr">{formatAddress(item.addr.toString())}</div>
                        <div className="win-count">V2</div>
                        <div className="lose-count">D6</div>
                        <div
                          className="fight-icon"
                          onClick={() => showDialog(index)}
                        >
                          <img src={fightIcon} alt="fight"/>
                        </div>
                      </li>
                    ))
                  }
                </ul>
                <div className="my-rank-info rank-row">
                  <div className="rank-num">12</div>
                  <div className="username">Tom</div>
                  <div className="addr">0x34..35</div>
                  <div className="win-count">V2</div>
                  <div className="lose-count">D6</div>

                </div>
              </div>
            </div>
            <div className="right-content">
              <h3>My Battle Logs</h3>
              <ul className="ffa-logs-wrapper">
                <li>
                  <div className="ffa-content">I challenged XX Victory</div>
                  <time>11/25 20:20</time>
                </li>
                <li>
                  <div className="ffa-content">XX challenged me Lose</div>
                  <time>11/24 21:20</time>
                </li>
              </ul>
            </div>
          </div>
        }
      </section>

      <Dialog visible={dialogVisible}>
        <div className={'dialog-user'}>
          <div className="dialog-userinfo">
            <dl>
              <dt>HP</dt>
              <dd>{targetData?.current?.hp}</dd>
            </dl>
            <dl>
              <dt>Attack</dt>
              <dd>{targetData?.current?.attack}</dd>
            </dl>
            <dl>
              <dt>Defense</dt>
              <dd>{targetData?.current?.defense}</dd>
            </dl>
            <dl>
              <dt>Speed</dt>
              <dd>{targetData?.current?.speed}</dd>
            </dl>
          </div>

          <div className="dialog-opt">
            <button className="battle-opt mi-btn" onClick={() => setSkillVisible(true)}>Battle</button>
            <button
              className="battle-opt mi-btn"
              onClick={closeDialog}
            >OK</button>

          </div>
        </div>
      </Dialog>
      {skillVisible ? (
        <div className="skill-wrap">
          <div>
            <div className="skill-list">
              <div className="skill-item" onClick={() => setSkillId(0)}>
                <div className="placeholder" style={{borderColor: skillId == 0 ? 'red' : '#DCC7AF'}}></div>
                <div>HP Boost</div>
              </div>
              <div className="skill-item" onClick={() => setSkillId(1)}>
                <div className="placeholder" style={{borderColor: skillId == 1 ? 'red' : '#DCC7AF'}}></div>
                <div>SPD Surge</div>
              </div>
              <div className="skill-item" onClick={() => setSkillId(2)}>
                <div className="placeholder" style={{borderColor: skillId == 2 ? 'red' : '#DCC7AF'}}></div>
                <div>Chain ATK</div>
              </div>
            </div>
            <div className="desc">
              <p>Select one of the three skills for the battle:</p>
              <p>HP Boost: Increases HP by 100.</p>
              <p>SPD Surge: Boosts speed by 100.</p>
              <p>Chain ATK: 20% chance of a consecutive attack.</p>
            </div>
            <div className="btn-list">
              <button className="battle-opt mi-btn" onClick={() => setSkillVisible(false)}>Cancel</button>
              <button className="battle-opt mi-btn" onClick={battleFun}>OK</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FFA;