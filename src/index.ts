import { ILayoutRestorer, JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { ICommandPalette, MainAreaWidget, WidgetTracker } from '@jupyterlab/apputils';
import * as cells from "@jupyterlab/cells";
import { Widget } from '@lumino/widgets';
import { CommandRegistry } from "@lumino/commands";
import { INotebookTracker, NotebookPanel } from "@jupyterlab/notebook";
import { ICellModel, Cell } from "@jupyterlab/cells";
import { DocumentRegistry } from "@jupyterlab/docregistry";
import { toolbox, encodeWorkspace, decodeWorkspace, getModelAtributes, processLoadedBlocks } from './toolbox';
import * as Blockly from 'blockly/core';
import * as libraryBlocks from 'blockly/blocks';
import { pythonGenerator } from 'blockly/python';
import * as En from 'blockly/msg/en';
Blockly.setLocale(En);

class BlocklyWidget extends Widget {
  readonly notebooks: INotebookTracker;
  readonly generator: typeof pythonGenerator;
  "lastCell@": Cell;
  "blocksRendered@": boolean;
  "workspace@": Blockly.Workspace;
  "notHooked@": boolean;
  "init@34": number;
  public div: HTMLElement;
  constructor(notebooks: INotebookTracker) {
    super();
    this.notebooks = notebooks;
    this.generator = pythonGenerator;
    this.notebooks.activeCellChanged.connect(BlocklyWidget__get_onActiveCellChanged(this), this);
    
    this.div = document.createElement("div");
    this.div.id = "blocklyDivPython";
    this.node.appendChild(this.div);

    const buttonDiv: HTMLElement = document.createElement("div");
    buttonDiv.id = "buttonDivPython";
    const blocksToCodeButton: HTMLElement = document.createElement("button");
    blocksToCodeButton.innerText = "Blocks to Code";
    buttonDiv.appendChild(blocksToCodeButton);
    blocksToCodeButton.addEventListener("click", (_arg: Event): void => {
      BlocklyWidget__RenderCode(this);
  });
    
    const codeToBlocksButton: HTMLElement = document.createElement("button");
    codeToBlocksButton.innerText = "Code to Blocks";
    codeToBlocksButton.addEventListener("click", (_arg_1: Event): void => {
      BlocklyWidget__RenderBlocks(this);
    });
    buttonDiv.appendChild(codeToBlocksButton);
    
    const bugReportButton: HTMLElement = document.createElement("button");
    bugReportButton.innerText = "Report Bug";
    bugReportButton.addEventListener("click", (_arg_2: Event): void => {
      const win: Window = window.open("https://github.com/aolney/jupyterlab-blockly-python-extension/issues", "_blank")!;
      if(win){
        win.focus();
      }
    });
    buttonDiv.appendChild(bugReportButton);

    const syncCheckbox: HTMLInputElement = document.createElement("input");
    syncCheckbox.setAttribute("type", "checkbox");
    syncCheckbox.checked = true;
    syncCheckbox.id = "syncCheckboxPython";

    const syncCheckboxLabel: HTMLElement = document.createElement("label");
    syncCheckboxLabel.innerText = "Notebook Sync";
    syncCheckboxLabel.setAttribute("for", "syncCheckboxPython");
    buttonDiv.appendChild(syncCheckbox);
    buttonDiv.appendChild(syncCheckboxLabel);

    this.node.appendChild(buttonDiv);

    // this["lastCell@"] = defaultOf();
    this["blocksRendered@"] = false;
    // this["workspace@"] = defaultOf();
    this["notHooked@"] = true;
    this["init@34"] = 1;
  }
  onAfterAttach(): void{
    libraryBlocks;
    const this$: BlocklyWidget = this;
    BlocklyWidget__set_workspace(this$, Blockly.inject("blocklyDivPython", {
      toolbox: toolbox,
      zoom:
         {controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2,
          pinch: true
        },
    }));
    console.log("jupyterlab_blockly_extension_python: blockly palette initialized");
    const logListener = (e: Blockly.Events.Abstract): void => {
      if (e.type === "create") {
          BlocklyWidget__set_blocksRendered(this$, false);
      }
      if (e.type === "finished_loading") {
          BlocklyWidget__set_blocksRendered(this$, true);
      }
      //LogToServer(BlocklyLogEntry082720_Create<Blockly.Events.BlockBase>(e.type, e));
    }
    BlocklyWidget__get_workspace(this$).removeChangeListener(logListener);
    BlocklyWidget__get_workspace(this$).addChangeListener(logListener);
    
    BlocklyWidget__get_workspace(this$).addChangeListener(function(event) {
      if (event instanceof Blockly.Events.BlockMove && event.newParentId) {
        
        const parentBlock: Blockly.Block | null = BlocklyWidget__get_workspace(this$).getBlockById(event.newParentId);
        const block: Blockly.Block | null = event.blockId ? BlocklyWidget__get_workspace(this$).getBlockById(event.blockId) : null;
        
        if(block && parentBlock && parentBlock.type == "variables_set"){
          getModelAtributes(block, parentBlock, BlocklyWidget__get_workspace(this$));
        }

      }

    });
    
    
  }
  onResize = (msg: Widget.ResizeMessage): void => {
    let copyOfStruct: number = msg.width;
    let copyOfStruct_1: number = msg.width;
    const this$: BlocklyWidget = this;
    const blocklyDiv: HTMLElement = document.getElementById("blocklyDivPython")!;
    const buttonDiv: HTMLElement = document.getElementById("buttonDivPython")!;
    const adjustedHeight: number = msg.height - 30;
    blocklyDiv.setAttribute("style", ((("width: " + ((copyOfStruct = msg.width, copyOfStruct.toString()))) + "px; height: ") + adjustedHeight.toString()) + "px");
    buttonDiv.setAttribute("style", ((((((("position: absolute; top: " + adjustedHeight.toString()) + "px; left: ") + "0") + "px; width: ") + ((copyOfStruct_1 = msg.width, copyOfStruct_1.toString()))) + "px; height: ") + "30") + "px");
    Blockly.svgResize(BlocklyWidget__get_workspace(this$) as Blockly.WorkspaceSvg);
  };
}

export function BlocklyWidget__set_workspace(__: BlocklyWidget, v: Blockly.Workspace): void {
  __["workspace@"] = v;
}

export function BlocklyWidget__get_workspace(__: BlocklyWidget): Blockly.Workspace {
  return __["workspace@"];
}

export function BlocklyWidget__get_Notebooks(this$: BlocklyWidget): INotebookTracker {
  return this$.notebooks;
}

export function BlocklyWidget_factor(notebooks: INotebookTracker): BlocklyWidget {
  return new BlocklyWidget(notebooks);
}

export function BlocklyWidget__set_blocksRendered(__: BlocklyWidget, v: boolean): void {
  __["blocksRendered@"] = v;
};

export function BlocklyWidget__get_blocksRendered(__: BlocklyWidget): boolean {
  return __["blocksRendered@"];
};

export function BlocklyWidget__get_notHooked(__: BlocklyWidget): boolean {
  return __["notHooked@"];
};

export function BlocklyWidget__set_notHooked(__: BlocklyWidget, v: boolean): void {
  __["notHooked@"] = v;
};

export function BlocklyWidget__get_lastCell(__: BlocklyWidget): Cell {
  return __["lastCell@"];
};

export function BlocklyWidget__set_lastCell(__: BlocklyWidget, v: Cell): void {
  __["lastCell@"] = v;
}

export function BlocklyWidget__get_onActiveCellChanged(this$: BlocklyWidget): (arg0: INotebookTracker, arg1: Cell<ICellModel> | null) => boolean {
  return (sender: INotebookTracker, args: Cell<ICellModel> | null): boolean => {
    if(args){
      // LogToServer(JupyterLogEntry082720_Create("active-cell-change", args.node.outerText));
      const syncCheckbox: HTMLElement | null = document.getElementById("syncCheckboxPython");
      const autosaveCheckbox: HTMLElement | null = document.getElementById("autosaveCheckboxPython");

      const isChecked = (aCheckbox: any): boolean => {
        if (aCheckbox) {
          return aCheckbox.checked;
        }
        else {
          return false;
        }
      }
      if (isChecked(syncCheckbox) && this$.notebooks.activeCell) {
        if (BlocklyWidget__get_blocksRendered(this$) && BlocklyWidget__ActiveCellSerializedBlocksWorkspaceOption(this$) == null) {
          BlocklyWidget__clearBlocks(this$);
        }
        else {
          BlocklyWidget__RenderBlocks(this$);
        }
      }
      if (isChecked(autosaveCheckbox) && this$.notebooks.activeCell) {
        BlocklyWidget__RenderCodeToLastCell(this$);
        BlocklyWidget__set_lastCell(this$, args);
      }

    }
      return true;
  };
};

export function BlocklyWidget__ActiveCellSerializedBlocksWorkspaceOption(this$: BlocklyWidget): string | null {
  if (this$.notebooks.activeCell) {
    const xmlString: string = this$.notebooks.activeCell.model.sharedModel.getSource();
    if (xmlString.indexOf("xmlns") >= 0) {
      const regex = /(<xml[\s\S]+<\/xml>)/;
      let xmlStringOption = xmlString.match(regex);
      if(xmlStringOption && xmlStringOption[0]){
        return xmlStringOption[0]
      }
    }
    else {
      return null;
    }
  }
  return null;
};

/**
 * Render blocks to code
 */
export function BlocklyWidget__RenderCode(this$: BlocklyWidget): void {
  let model: ICellModel;
  const code: string = this$.generator.workspaceToCode(BlocklyWidget__get_workspace(this$));
  if(this$.notebooks.activeCell){
    if ((model = this$.notebooks.activeCell.model, cells.isMarkdownCellModel(model))) {
      window.alert("You are calling \'Blocks to Code\' on a MARKDOWN cell. Select an empty CODE cell and try again.");
    }
    else {
      this$.notebooks.activeCell.model.sharedModel.setSource(code + "\n#" + encodeWorkspace());
      console.log(("jupyterlab_blockly_extension_python: wrote to active cell\n" + code) + "\n");
      // LogToServer(JupyterLogEntry082720_Create("blocks-to-code", this$.notebooks.activeCell.model.value.text));
      BlocklyWidget__set_blocksRendered(this$, true);
    }
  }
  else {
    console.log(("jupyterlab_blockly_extension_python: no cell active, flushed\n" + code) + "\n");
  }
};

/**
 * Render blocks in workspace using xml. Defaults to xml present in active cell
 */
export function BlocklyWidget__RenderBlocks(this$: BlocklyWidget): void {
  if(this$.notebooks.activeCell){
    const xmlString: string = this$.notebooks.activeCell.model.sharedModel.getSource();
    const regex = /(<xml[\s\S]+<\/xml>)/;
    let xmlStringOption = xmlString.match(regex);
    try {
      if(xmlStringOption && xmlStringOption[1]){
        const xmlString: string = xmlStringOption[1];
        BlocklyWidget__clearBlocks(this$);
        decodeWorkspace(xmlString);

        // Function to verify whether a block is connected to a variable,
        // assisting in the processing of the 'score' block logic
        const workspace = BlocklyWidget__get_workspace(this$);
        processLoadedBlocks(workspace);

      }
    } catch (e: any) {
      window.alert("Unable to perform \'Code to Blocks\': XML is either invald or renames existing variables. Specific error message is: " + e.message);
      console.log("jupyterlab_blockly_extension_python: unable to decode blocks, last line is invald xml");
    }
  }
  else {
    console.log("jupyterlab_blockly_extension_python: unable to decode blocks, active cell is null");
  }
};

/**
 * Auto-save: Render blocks to code if we are on a code cell, we've previously saved to it, and have any blocks on the workspace
 */
export function BlocklyWidget__RenderCodeToLastCell(this$: BlocklyWidget): void {
  let model: ICellModel;
  const code: string = this$.generator.workspaceToCode(BlocklyWidget__get_workspace(this$));
  if (BlocklyWidget__get_lastCell(this$)) {
    if (BlocklyWidget__get_lastCell(this$).model) {
      if ((model = BlocklyWidget__get_lastCell(this$).model, cells.isCodeCellModel(model))) {
        if ((() => {
          try {
            const xmlString: string = BlocklyWidget__get_lastCell(this$).model.sharedModel.getSource();
            if (xmlString.indexOf("xmlns") >= 0) {
              const regex = /(<xml[\s\S]+<\/xml>)/;
              let xmlStringOption = xmlString.match(regex);
              if(xmlStringOption && xmlStringOption[0]){
                return xmlStringOption[0]
              }
            }
          }
          catch (matchValue: any) {
              return false;
          }
        })()) {
          const blocks: Blockly.Block[] = BlocklyWidget__get_workspace(this$).getAllBlocks(false);
          if (blocks.length > 0) {
            BlocklyWidget__get_lastCell(this$).model.sharedModel.setSource(code + "\n#" + encodeWorkspace());
            console.log(("jupyterlab_blockly_extension_python: wrote to active cell\n" + code) + "\n");
            // LogToServer(JupyterLogEntry082720_Create("blocks-to-code-autosave", this$.notebooks.activeCell.model.value.text));
          }
        }
      }
    }
  }
  else {
    console.log(("jupyterlab_blockly_extension_python: no cell active, flushed instead of autosave\n" + code) + "\n");
  }
};

export function BlocklyWidget__clearBlocks(this$: BlocklyWidget): void {
  const workspace: Blockly.Workspace = Blockly.getMainWorkspace();
  const blocks = workspace.getAllBlocks(false);
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    block.dispose(false);
  }
}

/**
 * Attach a MainAreaWidget by splitting the viewing area and placing in the left hand pane, if possible
 */
export function attachWidget(app: JupyterFrontEnd, notebooks: INotebookTracker, widget: MainAreaWidget): void {
  if (!widget.isAttached) {
    const matchValue: NotebookPanel | null = notebooks.currentWidget;
    if (matchValue == null) {
      app.shell.add(widget, "main");
    }
    else {
      const c: NotebookPanel = matchValue;
      const options: DocumentRegistry.IOpenOptions = {
        ref: c.id,
        mode: "split-left",
      };
      c.context.addSibling(widget, options);
    }
  }
  app.shell.activateById(widget.id);
};

/**
 * Return a MainAreaWidget wrapping a BlocklyWidget
 */
export function createMainAreaWidget<BlocklyWidget>(bw: BlocklyWidget): MainAreaWidget {
  const w: MainAreaWidget = new MainAreaWidget({
    content: bw as any,
  });
  w.id = "blockly-jupyterlab-python";
  w.title.label = "Blockly Python";
  w.title.closable = true;
  return w;
};

async function activate(app: JupyterFrontEnd, palette: ICommandPalette, notebooks: INotebookTracker, restorer: ILayoutRestorer | null, panel: NotebookPanel) {
  console.log('blockly extension is activated!');

  const blocklyWidget: BlocklyWidget = BlocklyWidget_factor(notebooks);
  let widget: MainAreaWidget<any> = createMainAreaWidget(blocklyWidget);

  const tracker: WidgetTracker<MainAreaWidget<any>> = new WidgetTracker({
    namespace: "blockly_python",
  });

  if(restorer){
    restorer.restore(tracker, {
      command: "blockly_python:open",
      name: (): string => "blockly_python",
    });
  };

  app.commands.addCommand("blockly_python:open", {
    label: 'Blockly Python',
    execute: (): void => {
      if (!widget || widget.isDisposed) {
        widget = createMainAreaWidget<any>(blocklyWidget);
      }
      attachWidget(app, notebooks, widget);
      if (!tracker.has(widget)) {
        tracker.add(widget);
      }
    }
  } as CommandRegistry.ICommandOptions);

  palette.addItem({
    command: "blockly_python:open",
    category: "Blockly",
  });

};

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-apod',
  description: 'blockly extension for jupyter lab.',
  autoStart: true,
  requires: [ICommandPalette, INotebookTracker, ILayoutRestorer],
  activate: activate
};

export default plugin;
