import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useWorkspaces } from '../providers/Workspaces';
import api, { Workspace } from '../utils/api';
import Storage from '../utils/Storage';
import { useUser } from './UserProvider';

interface StepFunctionsParameters {
  push: ReturnType<typeof useRouter>['push'];
  workspaces: ReturnType<typeof useWorkspaces>['workspaces'];
  createWorkspace: () => Promise<Workspace>;
}

interface Step {
  title: string;
  text: string;
  highlight: () => DOMRect | null;
  onLoad?: (p: StepFunctionsParameters) => Promise<void> | void;
  onClick?: (p: StepFunctionsParameters) => Promise<void> | void;
}

const steps: Step[] = [
  {
    title: 'onboarding.step1.title',
    text: 'onboarding.step1.text',
    highlight: () => {
      return new DOMRect();
    },
    onLoad: async ({ push }) => {
      await push('/workspaces');
    },
  },
  {
    title: 'onboarding.step2.title',
    text: 'onboarding.step2.text',
    highlight: () => {
      const target = document.querySelector('.onboarding-step-2');
      if (!target) return null;
      const rect = target.getBoundingClientRect();

      return new DOMRect(
        rect.x - 10,
        rect.y + 20,
        rect.width + 20,
        rect.height
      );
    },
    onLoad: async ({ push }) => {
      await push('/workspaces');
    },
  },
  {
    title: 'onboarding.step3.title',
    text: 'onboarding.step3.text',
    highlight: () => {
      const target = document.querySelector('.onboarding-step-3');
      if (!target) return null;
      const rect = target.getBoundingClientRect();

      return new DOMRect(
        rect.x - 10,
        rect.y - 15,
        rect.width + 20,
        rect.height + 30
      );
    },
    onClick: async ({ push, workspaces, createWorkspace }) => {
      let workspace = workspaces[0];
      if (!workspace) {
        workspace = await createWorkspace();
      }
      push(`/workspaces/${workspace.id}`);
    },
    onLoad: async ({ push }) => {
      await push('/workspaces');
    },
  },
  {
    title: 'onboarding.step4.title',
    text: 'onboarding.step4.text',
    highlight: () => {
      const target = document.querySelector('.onboarding-step-4');
      if (!target) return null;
      const rect = target.getBoundingClientRect();

      return new DOMRect(
        rect.x - 10,
        rect.y - 15,
        rect.width + 20,
        rect.height + 30
      );
    },
    onLoad: async ({ push, workspaces }) => {
      if (!workspaces[0]) return;
      await push(`/workspaces/${workspaces[0].id}`);
    },
  },
  {
    title: 'onboarding.step5.title',
    text: 'onboarding.step5.text',
    highlight: () => {
      const target = document.querySelector('.onboarding-step-5');
      if (!target) return null;
      const rect = target.getBoundingClientRect();

      return new DOMRect(rect.x - 10, rect.y, rect.width + 10, rect.height);
    },
    onLoad: async ({ push, workspaces }) => {
      if (!workspaces[0]) return;
      await push(`/workspaces/${workspaces[0].id}`);
    },
  },
];

export const OnBoarding = () => {
  const { user } = useUser();
  const { push } = useRouter();
  const { t } = useTranslation('workspaces');
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [highlight, setHighlight] =
    useState<ReturnType<Step['highlight']>>(null);
  const { workspaces } = useWorkspaces();
  const pushRef = useRef(push);
  useEffect(() => {
    pushRef.current = push;
  }, [push]);
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);
  const currentStepIndex = +Storage.get('__onboardingstep') || 0;
  const createWorkspace = useCallback(async () => {
    return await api.createWorkspace(tRef.current('create.defaultName'));
  }, []);

  useEffect(() => {
    async function loadStep() {
      if (!user || user.meta?.onboarded) {
        setCurrentStep(null);
        return;
      }
      const currentStep = steps[currentStepIndex];
      if (currentStep && currentStep.onLoad) {
        await currentStep.onLoad({
          push: pushRef.current,
          workspaces,
          createWorkspace,
        });
      }
      setCurrentStep(currentStep);
    }
    loadStep();
  }, [createWorkspace, currentStepIndex, user, workspaces]);

  const getHighlight = useCallback(() => {
    const highlight = currentStep?.highlight();
    setHighlight(highlight || null);
    return highlight;
  }, [currentStep]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    function getHL() {
      if (!currentStep) return;
      const highlight = getHighlight();

      if (!highlight) {
        t = setTimeout(getHL, 200);
      }
    }
    getHL();
    return () => {
      clearTimeout(t);
    };
  }, [currentStep, getHighlight]);

  const click = useCallback(async () => {
    if (!currentStep) return;
    await currentStep.onClick?.({
      push: pushRef.current,
      workspaces,
      createWorkspace,
    });
    const nextStepIndex = currentStepIndex + 1;
    const nextStep = steps[nextStepIndex];
    if (!nextStep) {
      // api.setOnboarded()
      api.users().setMeta('onboarded', true);
      user.meta = {
        ...user.meta,
        onboarded: true,
      };
      Storage.remove('__onboardingstep');
      setCurrentStep(null);
      return;
    }
    Storage.set('__onboardingstep', nextStepIndex);
    setCurrentStep(nextStep);
  }, [createWorkspace, currentStep, currentStepIndex, user, workspaces]);

  const prev = useCallback(() => {
    const prevStepIndex = currentStepIndex - 1;
    const prevStep = steps[prevStepIndex];
    Storage.set('__onboardingstep', prevStepIndex);
    setCurrentStep(prevStep);
  }, [currentStepIndex]);
  const next = useCallback(() => {
    click();
  }, [click]);
  const hasPrev = currentStepIndex > 0;
  const hasNext = currentStepIndex < steps.length;

  if (!currentStep) return null;

  return (
    <>
      {highlight && (
        <div
          className="fixed top-0 left-0 bottom-0 right-0 z-40"
          style={{
            borderStyle: 'solid',
            borderColor: 'rgba(0, 0, 0, .2)',
            borderTopWidth: `${highlight.top}px`,
            borderBottomWidth: `${window.innerHeight - highlight.bottom}px`,
            borderRightWidth: `${window.innerWidth - highlight.right}px`,
            borderLeftWidth: `${highlight.left}px`,
          }}
          onClick={click}
        ></div>
      )}
      <div className="fixed bottom-16 right-16 p-16 rounded bg-white shadow-2xl z-50 max-w-[430px]">
        <div className="text-accent text-2xl pb-8">{t(currentStep.title)}</div>
        <div
          className="text-2xl"
          dangerouslySetInnerHTML={{
            __html: t(currentStep.text, {
              link5: 'link5',
            }),
          }}
        />
        <div className="flex flex-row mt-2 justify-end">
          <button
            className={`flex w-6 h-6 mr-2 items-center justify-center bg-black rounded-[50%] text-white ${
              hasPrev ? '' : 'opacity-20'
            }`}
            onClick={prev}
            disabled={!hasPrev}
          >
            ◀
          </button>
          <button
            className={`flex w-6 h-6 ml-2 items-center justify-center bg-black rounded-[50%] text-white ${
              hasNext ? '' : 'opacity-20'
            }`}
            onClick={next}
            disabled={!hasNext}
          >
            ▶
          </button>
        </div>
      </div>
    </>
  );
};
export default OnBoarding;
